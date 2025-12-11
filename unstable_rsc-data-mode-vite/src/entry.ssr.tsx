import { createFromReadableStream } from "@vitejs/plugin-rsc/ssr";
import { renderToReadableStream } from "react-dom/server";
import {
  unstable_routeRSCServerRequest as routeRSCServerRequest,
  unstable_RSCStaticRouter as RSCStaticRouter,
} from "react-router";

export async function generateHTML(
  request: Request,
  serverResponse: Response,
): Promise<Response> {
  return await routeRSCServerRequest({
    // The incoming request.
    request,
    // The response from the RSC server.
    serverResponse,
    // Provide the React Server touchpoints.
    createFromReadableStream,
    // Render the router to HTML.
    async renderHTML(getPayload, options) {
      const formState = await getPayload().formState;

      const bootstrapScriptContent =
        await import.meta.viteRsc.loadBootstrapScriptContent("index");

      return await renderToReadableStream(
        <RSCStaticRouter getPayload={getPayload} />,
        {
          ...options,
          bootstrapScriptContent,
          formState,
          signal: request.signal,
        },
      );
    },
  });
}
