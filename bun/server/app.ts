
import { createRequestHandler } from "react-router";


import { type Serve } from "bun";

const rr7 = createRequestHandler(
  //@ts-ignore
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {

  async fetch(request) {

    let { pathname } = new URL(request.url);
    let file = Bun.file(`build/client${pathname}`);
    // Check if the file exists
    // you can add static file caching here
    if (await file.exists()) return new Response(file);
    // Only if a file doesn't exists we send the request to the Remix request handler
    return rr7(request);
  },
} satisfies Serve;