import { serveDir, serveFile } from "@std/http/file-server";
import type { ServerBuild } from "react-router";
import { createRequestHandler } from "react-router";

const handler = createRequestHandler(
  () => import("./build/server/index.js") as Promise<ServerBuild>,
  "production",
);

const PORT = parseInt(Deno.env.get("PORT") ?? "8000", 10);

Deno.serve({ port: PORT }, async (request: Request): Promise<Response> => {
  const pathname = new URL(request.url).pathname;

  if (pathname === "/favicon.ico") {
    return serveFile(request, "build/client/favicon.ico");
  }

  if (pathname.startsWith("/assets/")) {
    return serveDir(request, {
      fsRoot: "build/client/assets",
      urlRoot: "assets",
      headers: [
        "Cache-Control: public, max-age=31536000, immutable",
      ],
    });
  }

  return await handler(request);
});
