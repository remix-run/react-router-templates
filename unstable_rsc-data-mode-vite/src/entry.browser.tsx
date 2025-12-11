import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import {
  createFromReadableStream,
  createTemporaryReferenceSet,
  encodeReply,
  setServerCallback,
} from "@vitejs/plugin-rsc/browser";
import {
  unstable_createCallServer as createCallServer,
  unstable_getRSCStream as getRSCStream,
  unstable_RSCHydratedRouter as RSCHydratedRouter,
  type unstable_RSCRenderPayload as RSCRenderPayload,
} from "react-router/dom";

setServerCallback(
  createCallServer({
    createFromReadableStream,
    createTemporaryReferenceSet,
    encodeReply,
  })
);

createFromReadableStream<RSCRenderPayload>(getRSCStream()).then((payload) => {
  startTransition(async () => {
    const formState = await payload.formState;

    hydrateRoot(
      document,
      <StrictMode>
        <RSCHydratedRouter
          payload={payload}
          createFromReadableStream={createFromReadableStream}
        />
      </StrictMode>,
      {
        // @ts-expect-error - no types for this yet
        formState,
      }
    );
  });
});
