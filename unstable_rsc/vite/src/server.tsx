import {
  decodeAction,
  decodeFormState,
  decodeReply,
  loadServerAction,
  renderToReadableStream,
} from "@hiogawa/vite-rsc/rsc";
import { unstable_matchRSCServerRequest as matchRSCServerRequest } from "react-router";

import { routes } from "./routes/routes";

function fetchServer(request: Request) {
  return matchRSCServerRequest({
    // Provide the React Server touchpoints.
    decodeAction,
    decodeFormState,
    decodeReply,
    loadServerAction,
    // The incoming request.
    request,
    // The app routes.
    routes: routes(),
    // Encode the match with the React Server implementation.
    generateResponse(match) {
      return new Response(renderToReadableStream(match.payload), {
        status: match.statusCode,
        headers: match.headers,
      });
    },
  });
}

export default async function handler(request: Request) {
  // Import the prerender function from the client envrionment
  const ssr = await import.meta.viteRsc.loadModule<
    typeof import("./prerender")
  >("ssr", "index");

  return ssr.prerender(request, fetchServer);
}
