import { existsSync } from "node:fs";

// Load a local .env file if present (Docker/systemd pass real env vars instead).
if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

function read(name: string, fallback: string) {
  const value = process.env[name];
  return value && value.length > 0 ? value : fallback;
}

const isProduction = process.env.NODE_ENV === "production";

export const env = {
  databasePath: read("DATABASE_PATH", "./data/store.db"),
  staffPassword: read("STAFF_PASSWORD", "change-me"),
  sessionSecret: read("SESSION_SECRET", "dev-only-secret"),
  storeName: read("STORE_NAME", "Corner Store"),
  cookieSecure: read("COOKIE_SECURE", "false") === "true",
};

if (isProduction) {
  if (env.staffPassword === "change-me") {
    console.warn("[store] STAFF_PASSWORD is using the default value — set it!");
  }
  if (env.sessionSecret === "dev-only-secret") {
    console.warn("[store] SESSION_SECRET is not set — set it to a random string!");
  }
}
