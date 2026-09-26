import { listCategories } from "~/lib/db.server";

export function loader() {
  // Touch the database so the check fails if storage is broken.
  listCategories();
  return new Response("ok", { headers: { "Cache-Control": "no-store" } });
}
