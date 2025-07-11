import {
  createFromReadableStream,
  createTemporaryReferenceSet,
  encodeReply,
  setServerCallback,
} from "@vitejs/plugin-rsc/browser";
import { startTransition, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  unstable_createCallServer as createCallServer,
  unstable_RSCHydratedRouter as RSCHydratedRouter,
  type unstable_RSCPayload as RSCServerPayload,
} from "react-router";

// Create and set the callServer function to support post-hydration server actions.
setServerCallback(
  createCallServer({
    createFromReadableStream,
    createTemporaryReferenceSet,
    encodeReply,
  })
);

async function getRSCStream() {
  const url = new URL(window.location.href);
  url.pathname = url.pathname + ".rsc";

  const response = await fetch(url.toString());
  if (!response.body) throw new Error("No response body found");

  return response.body;
}

// Get and decode the initial server payload
getRSCStream().then((stream) =>
  createFromReadableStream<RSCServerPayload>(stream).then((payload) => {
    startTransition(async () => {
      createRoot(document).render(
        <StrictMode>
          <RSCHydratedRouter
            createFromReadableStream={createFromReadableStream}
            payload={payload}
            routeDiscovery="lazy"
          />
        </StrictMode>
      );
    });
  })
);
