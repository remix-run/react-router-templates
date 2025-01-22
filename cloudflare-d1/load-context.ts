import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./database/schema";
import type { ExecutionContext } from "@cloudflare/workers-types";
import type { AppLoadContext } from "react-router";

declare global {
  interface CloudflareEnvironment extends Env {}
}

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: CloudflareEnvironment;
      ctx: Omit<ExecutionContext, "props">;
    };
    db: DrizzleD1Database<typeof schema>;
  }
}

type GetLoadContextArgs = {
  request: Request;
  context: Pick<AppLoadContext, "cloudflare">;
};

export function getLoadContext({ context }: GetLoadContextArgs) {
  const db = drizzle(context.cloudflare.env.DB, { schema });

  return {
    cloudflare: context.cloudflare,
    db,
  };
}
