import "jsr:@std/dotenv/load";
import { handler } from "./server/app.ts";

const PORT = Number.parseInt(Deno.env.get("PORT") || "3000");

console.log("Starting production server");

Deno.serve({ port: PORT }, handler);
console.log(`Server is running on http://localhost:${PORT}`);
