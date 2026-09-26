import { useEffect } from "react";
import { data, Link, useRevalidator } from "react-router";

import { getOrderByCode } from "~/lib/db.server";
import { formatPrice, formatTime, STATUS_LABELS } from "~/lib/format";
import type { Route } from "./+types/order";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data ? `Order #${data.order.code}` : "Order" }];
}

export function loader({ params }: Route.LoaderArgs) {
  const order = getOrderByCode(params.code);
  if (!order) throw data("Order not found", { status: 404 });
  return { order };
}

const STEPS = ["new", "picking", "ready", "collected"] as const;

export default function OrderPage({ loaderData }: Route.ComponentProps) {
  const { order } = loaderData;
  const revalidator = useRevalidator();
  const done = order.status === "collected" || order.status === "cancelled";

  // Poll for status updates from the staff dashboard.
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible" && revalidator.state === "idle") {
        revalidator.revalidate();
      }
    }, 5000);
    return () => clearInterval(id);
  }, [done, revalidator]);

  const stepIndex = STEPS.indexOf(order.status as (typeof STEPS)[number]);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <section
        className={`rounded-3xl p-8 text-center text-white shadow-lg ${
          order.status === "ready"
            ? "bg-emerald-600"
            : order.status === "cancelled"
              ? "bg-rose-600"
              : "bg-gray-900 dark:bg-gray-800"
        }`}
      >
        <p className="text-sm font-medium uppercase tracking-widest opacity-80">
          Your order number
        </p>
        <p className="mt-2 font-mono text-6xl font-black tracking-widest">
          {order.code}
        </p>
        <p className="mt-4 text-xl font-semibold" aria-live="polite">
          {order.status === "ready"
            ? `Ready! Come to the counter, ${order.customerName}.`
            : order.status === "cancelled"
              ? "This order was cancelled. Please ask at the counter."
              : order.status === "collected"
                ? "Collected — thanks for shopping with us!"
                : `Thanks, ${order.customerName}! We're on it.`}
        </p>
      </section>

      {order.status !== "cancelled" && (
        <ol className="grid grid-cols-4 gap-2 text-center text-xs font-medium">
          {STEPS.map((step, i) => (
            <li key={step}>
              <div
                className={`mb-2 h-2 rounded-full ${
                  i <= stepIndex ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-800"
                }`}
              />
              <span className={i <= stepIndex ? "" : "text-gray-400"}>
                {STATUS_LABELS[step]}
              </span>
            </li>
          ))}
        </ol>
      )}

      <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
        <div className="flex items-baseline justify-between">
          <h2 className="font-bold">Items</h2>
          <span className="text-sm text-gray-500">
            Placed {formatTime(order.createdAt)}
          </span>
        </div>
        <ul className="mt-3 space-y-2">
          {order.items.map((item) => (
            <li key={item.productId} className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden>
                {item.emoji}
              </span>
              <span className="flex-1">
                {item.quantity} × {item.name}
              </span>
              <span className="tabular-nums">
                {formatPrice(item.priceCents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        {order.note && (
          <p className="mt-4 rounded-xl bg-gray-50 p-3 text-sm italic text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            “{order.note}”
          </p>
        )}
        <div className="mt-4 flex items-baseline justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
          <span className="font-medium">Total to pay at counter</span>
          <span className="text-2xl font-bold tabular-nums">
            {formatPrice(order.totalCents)}
          </span>
        </div>
      </section>

      <p className="text-center">
        <Link
          to="/"
          className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
        >
          ← Back to the store
        </Link>
      </p>
    </div>
  );
}
