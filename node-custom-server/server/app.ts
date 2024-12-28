import "react-router";
import { createRequestHandler } from "@react-router/express";
import express from "express";
import morgan from "morgan";
import compression from "compression";

declare module "react-router" {
  // If you need to pass data through from this script into React Router, this
  // will give you type safety throughout our app.
  interface AppLoadContext {
    VALUE_FROM_EXPRESS: string;
  }
}

export const app = express();

app.use(compression());
app.disable("x-powered-by");

app.use(
  createRequestHandler({
    // @ts-expect-error - virtual module provided by React Router at build time
    build: () => import("virtual:react-router/server-build"),
    getLoadContext() {
      // This is where we'll return the actual values we defined the types for
      // earlier in the file.
      return {
        VALUE_FROM_EXPRESS: "Hello from Express",
      };
    },
  }),
);
app.use(morgan("tiny"));
