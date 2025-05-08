import "jsr:@std/dotenv/load";
import { assert } from "@std/assert";

const DATABASE_URL = Deno.env.get("DATABASE_URL");
assert(DATABASE_URL, "DATABASE_URL is required");

export const kv = await Deno.openKv(DATABASE_URL);
