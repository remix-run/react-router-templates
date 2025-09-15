import { createRequestListener } from "@remix-run/node-fetch-server";
import compression from "compression";
import express from "express";
import { unstable_matchRSCServerRequest as matchRSCServerRequest } from "react-router";
import {
  createTemporaryReferenceSet,
  decodeAction,
  decodeFormState,
  decodeReply,
  loadServerAction,
  renderToReadableStream,
  // @ts-expect-error - no types for this yet
} from "react-server-dom-parcel/server.edge";

// Import the generateHTML function from the client environment
import { generateHTML } from "./entry.ssr" with { env: "react-client" };
import { routes } from "./routes/config";

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

const app = express();

// Serve static assets with compression and long cache lifetime.
app.use(
  "/client",
  compression(),
  express.static("dist/client", {
    immutable: true,
    maxAge: "1y",
  })
);
app.use(compression(), express.static("public"));

// Ignore Chrome extension requests.
app.get("/.well-known/appspecific/com.chrome.devtools.json", (_, res) => {
  res.status(404);
  res.end();
});

// Hookup our application.
app.use(
  createRequestListener((request) =>
    generateHTML(
      request,
      fetchServer,
      (routes as unknown as { bootstrapScript?: string }).bootstrapScript
    )
  )
);

const PORT = Number.parseInt(process.env.PORT || "3000");
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} (http://localhost:${PORT})`);
});
