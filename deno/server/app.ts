import { createDenoRequestHandler } from "./request-handler.ts";

export const handler = createDenoRequestHandler(
  // @ts-expect-error React Router server build is not typed
  await import("../build/server/index.js"),
);
