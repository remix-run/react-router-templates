import {
  createTemporaryReferenceSet,
  decodeAction,
  decodeFormState,
  decodeReply,
  loadServerAction,
  renderToReadableStream,
} from "@vitejs/plugin-rsc/rsc";
import { unstable_matchRSCServerRequest as matchRSCServerRequest } from "react-router";

import { routes } from "./routes/config.ts";

function fetchServer(request: Request) {
  return matchRSCServerRequest({
    // Provide the React Server touchpoints.
    createTemporaryReferenceSet,
    decodeAction,
    decodeFormState,
    decodeReply,
    loadServerAction,
    // The incoming request.
    request,
    // The app routes.
    routes: routes(),
    // Encode the match with the React Server implementation.
    generateResponse(match, options) {
      return new Response(renderToReadableStream(match.payload, options), {
        status: match.statusCode,
        headers: match.headers,
      });
    },
  });
}

export default {
  async fetch(request: Request) {
    const ssr = await import.meta.viteRsc.loadModule<
      typeof import("./entry.ssr.tsx")
    >("ssr", "index");

    return await ssr.generateHTML(request, await fetchServer(request));
  },
};

if (import.meta.hot) {
  import.meta.hot.accept();
}
