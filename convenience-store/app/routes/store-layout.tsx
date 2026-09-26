import { Link, NavLink, Outlet } from "react-router";

import { env } from "~/lib/env.server";
import { cartCount, getCartSession } from "~/lib/session.server";
import type { Route } from "./+types/store-layout";

export async function loader({ request }: Route.LoaderArgs) {
  const { cart, lastOrder } = await getCartSession(request);
  return {
    storeName: env.storeName,
    cartCount: cartCount(cart),
    lastOrder: lastOrder ?? null,
  };
}

export default function StoreLayout({ loaderData }: Route.ComponentProps) {
  const { storeName, cartCount, lastOrder } = loaderData;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="text-2xl" aria-hidden>
              🏪
            </span>
            {storeName}
          </Link>

          <div className="ml-auto flex items-center gap-2">
            {lastOrder && (
              <Link
                to={`/order/${lastOrder}`}
                className="hidden rounded-full px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 sm:block dark:text-gray-300 dark:hover:bg-gray-800"
              >
                My order #{lastOrder}
              </Link>
            )}
            <NavLink
              to="/cart"
              className="relative flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              <span aria-hidden>🧺</span>
              Basket
              <span
                className="min-w-6 rounded-full bg-white px-1.5 text-center text-sm text-emerald-700"
                aria-label={`${cartCount} items`}
              >
                {cartCount}
              </span>
            </NavLink>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="py-6 text-center text-xs text-gray-400">
        Pick your items, then collect them at the counter.
      </footer>
    </div>
  );
}
