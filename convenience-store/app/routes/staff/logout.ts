import { logOutStaff } from "~/lib/session.server";
import type { Route } from "./+types/logout";

export async function action({ request }: Route.ActionArgs) {
  return logOutStaff(request);
}

export async function loader({ request }: Route.LoaderArgs) {
  return logOutStaff(request);
}
