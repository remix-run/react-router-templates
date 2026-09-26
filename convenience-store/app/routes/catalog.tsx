import { Form, Link, useNavigation, useSubmit } from "react-router";

import { QuantityStepper } from "~/components/quantity-stepper";
import { listCategories, listProducts } from "~/lib/db.server";
import { env } from "~/lib/env.server";
import { formatPrice, MAX_PER_ITEM } from "~/lib/format";
import { getCartSession } from "~/lib/session.server";
import type { Route } from "./+types/catalog";

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: data?.storeName ?? "Store" },
    { name: "description", content: "Pick out the items you want." },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const category = url.searchParams.get("category") ?? "";
  const { cart } = await getCartSession(request);

  return {
    storeName: env.storeName,
    q,
    category,
    categories: listCategories(),
    products: listProducts({ q, category }),
    cart,
  };
}

export default function Catalog({ loaderData }: Route.ComponentProps) {
  const { q, category, categories, products, cart } = loaderData;
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  const categoryHref = (c: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (c) params.set("category", c);
    const s = params.toString();
    return s ? `/?${s}` : "/";
  };

  // Group products by category for the "All" view.
  const groups = new Map<string, typeof products>();
  for (const p of products) {
    groups.set(p.category, [...(groups.get(p.category) ?? []), p]);
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold sm:text-3xl">What can we get you?</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Tap items to add them to your basket. We'll pick them for you.
        </p>
      </section>

      <Form role="search" className="relative">
        {category && <input type="hidden" name="category" value={category} />}
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400">
          🔍
        </span>
        <input
          type="search"
          name="q"
          defaultValue={q}
          key={q}
          placeholder="Search products…"
          aria-label="Search products"
          onChange={(e) =>
            submit(e.currentTarget.form, { replace: true, preventScrollReset: true })
          }
          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-lg shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-gray-800 dark:bg-gray-900"
        />
      </Form>

      <nav
        aria-label="Categories"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
      >
        {["", ...categories].map((c) => {
          const active = c === category;
          return (
            <Link
              key={c || "all"}
              to={categoryHref(c)}
              preventScrollReset
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "bg-white text-gray-700 shadow-sm hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {c || "All"}
            </Link>
          );
        })}
      </nav>

      <div className={searching ? "opacity-60 transition" : undefined}>
        {products.length === 0 ? (
          <p className="rounded-2xl bg-white p-10 text-center text-gray-500 dark:bg-gray-900">
            No products match “{q}”.
          </p>
        ) : (
          [...groups].map(([group, items]) => (
            <section key={group} className="mb-8">
              <h2 className="mb-3 text-lg font-bold text-gray-700 dark:text-gray-300">
                {group}
              </h2>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((p) => {
                  const inCart = cart[p.id] ?? 0;
                  return (
                    <li
                      key={p.id}
                      className={`flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 dark:bg-gray-900 ${
                        inCart
                          ? "ring-2 ring-emerald-500"
                          : "ring-gray-200 dark:ring-gray-800"
                      }`}
                    >
                      <div
                        className="mb-3 flex aspect-[4/3] items-center justify-center rounded-xl bg-gray-50 text-5xl sm:text-6xl dark:bg-gray-800"
                        aria-hidden
                      >
                        {p.emoji}
                      </div>
                      <h3 className="font-semibold leading-tight">{p.name}</h3>
                      <p className="mt-0.5 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                        {p.description}
                      </p>
                      <div className="mb-3 mt-auto flex items-baseline justify-between pt-2">
                        <span className="text-lg font-bold">
                          {formatPrice(p.priceCents)}
                        </span>
                        {p.stock > 0 && p.stock <= 5 && (
                          <span className="text-xs font-medium text-amber-600">
                            Only {p.stock} left
                          </span>
                        )}
                      </div>
                      <QuantityStepper
                        productId={p.id}
                        productName={p.name}
                        quantity={inCart}
                        max={Math.min(p.stock, MAX_PER_ITEM)}
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
