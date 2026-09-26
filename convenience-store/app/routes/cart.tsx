import { data, Form, Link, redirect, useNavigation } from "react-router";

import { QuantityStepper } from "~/components/quantity-stepper";
import { createOrder, getProductsByIds, OutOfStockError } from "~/lib/db.server";
import { formatPrice, MAX_PER_ITEM } from "~/lib/format";
import { getCartSession, setCartQuantity } from "~/lib/session.server";
import type { Route } from "./+types/cart";

export function meta() {
  return [{ title: "Your basket" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { cart } = await getCartSession(request);
  const products = getProductsByIds(Object.keys(cart).map(Number));

  const lines = products
    .filter((p) => p.active)
    .map((p) => ({ product: p, quantity: cart[p.id] }))
    .sort((a, b) => a.product.name.localeCompare(b.product.name));

  return {
    lines,
    totalCents: lines.reduce((s, l) => s + l.product.priceCents * l.quantity, 0),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = form.get("intent");
  const cartSession = await getCartSession(request);
  let { cart } = cartSession;
  const { session, commit } = cartSession;

  if (intent === "set") {
    const productId = Number(form.get("productId"));
    const quantity = Number(form.get("quantity"));
    if (!Number.isInteger(productId) || !Number.isFinite(quantity)) {
      throw data("Invalid request", { status: 400 });
    }
    const [product] = getProductsByIds([productId]);
    if (!product || !product.active) {
      throw data("Product not found", { status: 404 });
    }
    cart = setCartQuantity(cart, productId, Math.min(quantity, product.stock));
    session.set("cart", cart);
    return data({ error: null }, { headers: { "Set-Cookie": await commit() } });
  }

  if (intent === "clear") {
    session.set("cart", {});
    return data({ error: null }, { headers: { "Set-Cookie": await commit() } });
  }

  if (intent === "checkout") {
    const customerName = String(form.get("customerName") ?? "").trim().slice(0, 40);
    const note = String(form.get("note") ?? "").trim().slice(0, 200);
    const lines = Object.entries(cart)
      .map(([id, qty]) => ({ productId: Number(id), quantity: Math.min(qty, MAX_PER_ITEM) }))
      .filter((l) => l.quantity > 0);

    if (lines.length === 0) {
      return data({ error: "Your basket is empty." }, { status: 400 });
    }
    if (!customerName) {
      return data(
        { error: "Please enter a name so we can call you when it's ready." },
        { status: 400 },
      );
    }

    try {
      const code = createOrder({ customerName, note, lines });
      session.set("cart", {});
      session.set("lastOrder", code);
      return redirect(`/order/${code}`, {
        headers: { "Set-Cookie": await commit() },
      });
    } catch (error) {
      if (error instanceof OutOfStockError) {
        return data(
          {
            error: `Sorry, we don't have enough of: ${error.products.join(
              ", ",
            )}. Please adjust your basket.`,
          },
          { status: 409 },
        );
      }
      throw error;
    }
  }

  throw data("Unknown intent", { status: 400 });
}

export default function Cart({ loaderData, actionData }: Route.ComponentProps) {
  const { lines, totalCents } = loaderData;
  const navigation = useNavigation();
  const submitting =
    navigation.state !== "idle" &&
    navigation.formData?.get("intent") === "checkout";

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-white p-10 text-center shadow-sm dark:bg-gray-900">
        <div className="text-6xl" aria-hidden>
          🧺
        </div>
        <h1 className="mt-4 text-2xl font-bold">Your basket is empty</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Browse the shelves and add what you need.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Your basket{" "}
            <span className="text-gray-400">({itemCount})</span>
          </h1>
          <Form method="post">
            <button
              name="intent"
              value="clear"
              className="text-sm font-medium text-gray-500 hover:text-rose-600"
            >
              Clear all
            </button>
          </Form>
        </div>

        <ul className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm dark:divide-gray-800 dark:bg-gray-900">
          {lines.map(({ product, quantity }) => (
            <li key={product.id} className="flex items-center gap-4 p-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-4xl dark:bg-gray-800"
                aria-hidden
              >
                {product.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-gray-500">
                  {formatPrice(product.priceCents)} each
                </p>
                {product.stock < quantity && (
                  <p className="text-sm font-medium text-rose-600">
                    Only {product.stock} in stock
                  </p>
                )}
              </div>
              <div className="w-36 shrink-0">
                <QuantityStepper
                  productId={product.id}
                  productName={product.name}
                  quantity={quantity}
                  max={Math.min(product.stock, MAX_PER_ITEM)}
                />
              </div>
              <p className="hidden w-20 text-right font-semibold tabular-nums sm:block">
                {formatPrice(product.priceCents * quantity)}
              </p>
            </li>
          ))}
        </ul>

        <Link
          to="/"
          className="mt-4 inline-block font-medium text-emerald-700 hover:underline dark:text-emerald-400"
        >
          ← Keep shopping
        </Link>
      </section>

      <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm lg:sticky lg:top-24 dark:bg-gray-900">
        <h2 className="text-lg font-bold">Send to the counter</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Our staff will pick your items. Pay when you collect them.
        </p>

        <Form method="post" className="mt-5 space-y-4">
          <input type="hidden" name="intent" value="checkout" />
          <label className="block">
            <span className="text-sm font-medium">Your name</span>
            <input
              name="customerName"
              required
              maxLength={40}
              autoComplete="given-name"
              placeholder="e.g. Sam"
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-gray-700 dark:bg-gray-950"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">
              Note <span className="text-gray-400">(optional)</span>
            </span>
            <textarea
              name="note"
              rows={2}
              maxLength={200}
              placeholder="e.g. cold drinks please"
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-gray-700 dark:bg-gray-950"
            />
          </label>

          <div className="flex items-baseline justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
            <span className="font-medium">Total</span>
            <span className="text-2xl font-bold tabular-nums">
              {formatPrice(totalCents)}
            </span>
          </div>

          {actionData?.error && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300"
            >
              {actionData.error}
            </p>
          )}

          <button
            disabled={submitting}
            className="w-full rounded-xl bg-emerald-600 px-4 py-4 text-lg font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-60"
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
        </Form>
      </aside>
    </div>
  );
}
