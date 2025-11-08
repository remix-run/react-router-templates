import type { Server } from 'bun'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import url from 'node:url'
import type { ServerBuild } from 'react-router'
import { createRequestHandler } from 'react-router'

type RSCServerBuild = {
  fetch: (request: Request, client?: {
    address: string
    family: 'IPv4' | 'IPv6'
    port: number
  }) => Response
  publicPath: string
  assetsBuildDirectory: string
}

type IsomorphicServerBuild = (RSCServerBuild & { isRsc: true }) | (ServerBuild & { isRsc: false })

async function resolveBuildModule() {
  const buildPathArg = process.argv[process.argv.length - 1] ?? undefined
  if (!buildPathArg) {
    console.error(`Usage example: bun run server.ts build/server/index.js`)
    process.exit(1)
  }
  const buildPath = path.resolve(buildPathArg)
  const buildModule = await import(url.pathToFileURL(buildPath).href)
  return { buildPath, buildModule }
}

async function prepareServer(buildPath: string, buildModule: any) {
  let port = parseNumber(process.env.PORT) ?? 3000
  let build: IsomorphicServerBuild

  if (buildModule.default && typeof buildModule.default === 'function') {
    const config = {
      publicPath: '/',
      assetsBuildDirectory: '../client',
      ...(buildModule.unstable_reactRouterServeConfig || {}),
    }
    build = {
      fetch: buildModule.default,
      publicPath: config.publicPath,
      assetsBuildDirectory: path.resolve(path.dirname(buildPath), config.assetsBuildDirectory),
      isRsc: true,
    } satisfies IsomorphicServerBuild
  } else {
    build = {
      ...(buildModule as ServerBuild),
      isRsc: false,
    } satisfies IsomorphicServerBuild
  }

  return { port, build }
}

function runBunServer(build: IsomorphicServerBuild, port: number) {
  // It is recommended to use a dedicated static file server for production, e.g. nginx, with gzip compression enabled
  // This is a simple fallback using Bun to stream static files, but it's not serving them compressed.
  const handleStaticFiles = (req: Request): Response | null => {
    const filePath = new URL(req.url).pathname
    if (!filePath.startsWith(build.publicPath)) {
      return null
    }

    const safeFilePath = filePath.replace(/^\/+/, '').replace(/\.\./g, '').replace(/\/\//, '/')
    const fullPath = path.join(build.assetsBuildDirectory, safeFilePath)

    if (fs.existsSync(fullPath) && !fs.statSync(fullPath).isDirectory()) {
      const file = Bun.file(fullPath)
      return new Response(file, {
        headers: {
          'Content-Type': file.type,
          'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
        },
      })
    }

    return null
  }

  const server: Server<any> = Bun.serve({
    port,
    // reusePort: true, // uncomment to allow multiple instances to listen on the same port (e.g. for clustering)
    development: process.env.NODE_ENV !== 'production',
    fetch: async (req) => {
      const startTime = Date.now()
      const staticFile = handleStaticFiles(req)
      if (staticFile) {
        return staticFile
      }

      let response: Response
      try {
        if (build.isRsc) {
          const remote = server.requestIP(req)
          response = build.fetch(req, remote ?? undefined)
          if (typeof (response as any).then === 'function') {
            response = await response
          }
        } else {
          response = await createRequestHandler(build, process.env.NODE_ENV)(req)
        }
      } catch (error: unknown) {
        console.error('Uncaught error', error)
        response = new Response('Internal Server Error', { status: 500 })
      }

      // Add the total server processing time header to the response.
      // @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Server-Timing
      const serverTiming = Date.now() - startTime
      response.headers.set('Server-Timing', `total;dur=${serverTiming}`)
      logRequest(req, response, serverTiming)
      return response
    },
  })

    ;['SIGTERM', 'SIGINT'].forEach((signal) => {
      process.once(signal, () => server?.stop())
    })

  return server
}

function parseNumber(raw?: string | null) {
  if (raw === undefined || raw === null) return undefined
  let maybe = Number(raw)
  if (Number.isNaN(maybe)) return undefined
  return maybe
}

function logRequest(req: Request, response: Response, serverTiming: number): number {
  const pathname = new URL(req.url).pathname
  const statusCode = response.status

  console.log(`${req.method.toUpperCase()} ${pathname} - HTTP ${statusCode} - ${serverTiming}ms`)

  return serverTiming
}

async function main() {
  const buildModule = await resolveBuildModule()
  const { port, build } = await prepareServer(buildModule.buildPath, buildModule.buildModule)
  if (!build.publicPath || !build.assetsBuildDirectory) {
    throw new Error(`${buildModule.buildPath} is not a valid build file.`)
  }
  const server = runBunServer(build, port)
  console.log(`[Bun Server] Listening on ${server.url}`)
}

main()
