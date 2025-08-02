#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { readdir, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function findServerBuildDir() {
  const buildServerPath = join(__dirname, '..', 'build', 'server')

  try {
    // Check if the build/server directory exists
    await stat(buildServerPath)
  } catch (error) {
    console.error('Error: build/server directory not found. Please run "pnpm build" first.')
    process.exit(1)
  }

  try {
    const entries = await readdir(buildServerPath)

    // Find the first folder that starts with 'nodejs_'
    const nodejsFolder = entries.find((entry) => entry.startsWith('nodejs_'))

    if (!nodejsFolder) {
      console.error('Error: No nodejs_* folder found in build/server. Please run "pnpm build" first.')
      process.exit(1)
    }

    return join(buildServerPath, nodejsFolder)
  } catch (error) {
    console.error('Error reading build/server directory:', error.message)
    process.exit(1)
  }
}

async function startServer() {
  try {
    const serverBuildDir = await findServerBuildDir()
    const indexPath = join(serverBuildDir, 'index.js')

    console.log(`Starting server from: ${indexPath}`)

    // Spawn the react-router-serve process
    const child = spawn('react-router-serve', [indexPath], {
      stdio: 'inherit',
      env: { ...process.env },
    })

    child.on('error', (error) => {
      console.error('Failed to start server:', error.message)
      process.exit(1)
    })

    child.on('exit', (code) => {
      process.exit(code)
    })
  } catch (error) {
    console.error('Error starting server:', error.message)
    process.exit(1)
  }
}

startServer()
