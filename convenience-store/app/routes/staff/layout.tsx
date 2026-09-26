import { Form, NavLink, Outlet } from "react-router";

import { env } from "~/lib/env.server";
import { requireStaff } from "~/lib/session.server";
import type { Route } from "./+types/layout";

export async function loader({ request }: Route.LoaderArgs) {
  await requireStaff(request);
  return { storeName: env.storeName };
}

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-semibold ${
    isActive
      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
  }`;

export default function StaffLayout({ loaderData }: Route.ComponentProps) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
          <span className="mr-4 font-bold">
            🏪 {loaderData.storeName}{" "}
            <span className="font-normal text-gray-500">· Staff</span>
          </span>
          <nav className="flex gap-1">
            <NavLink to="/staff" end className={navClass}>
              Orders
            </NavLink>
            <NavLink to="/staff/products" className={navClass}>
              Products
            </NavLink>
          </nav>
          <Form method="post" action="/staff/logout" className="ml-auto">
            <button className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white">
              Log out
            </button>
          </Form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
