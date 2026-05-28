import { createContext } from "react-router";

import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as schema from "./schema";

export const databaseContext =
  createContext<PostgresJsDatabase<typeof schema>>();
