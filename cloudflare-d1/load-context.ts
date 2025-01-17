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
      ctx: ExecutionContext;
    };
    db: DrizzleD1Database<typeof schema>;
  }
}

export function getLoadContext(cloudflare: AppLoadContext["cloudflare"]) {
  const db = drizzle(cloudflare.env.DB, { schema });

  return {
    cloudflare,
    db,
  };
}
