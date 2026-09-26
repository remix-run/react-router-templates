import { useEffect } from "react";
import { data, useFetcher, useRevalidator } from "react-router";

import {
  listOrders,
  ORDER_STATUSES,
  setOrderStatus,
  type Order,
  type OrderStatus,
} from "~/lib/db.server";
import { formatPrice, formatTime, STATUS_LABELS, STATUS_STYLES } from "~/lib/format";
import { requireStaff } from "~/lib/session.server";
import type { Route } from "./+types/orders";

export function meta() {
  return [{ title: "Orders · Staff" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireStaff(request);
  return { orders: listOrders(["new", "picking", "ready"]) };
}

export async function action({ request }: Route.ActionArgs) {
  await requireStaff(request);
  const form = await request.formData();
  const id = Number(form.get("orderId"));
  const status = String(form.get("status")) as OrderStatus;
  if (!Number.isInteger(id) || !ORDER_STATUSES.includes(status)) {
    throw data("Invalid request", { status: 400 });
  }
  setOrderStatus(id, status);
  return { ok: true };
}

const COLUMNS: { status: OrderStatus; next?: OrderStatus; action?: string }[] = [
  { status: "new", next: "picking", action: "Start picking" },
  { status: "picking", next: "ready", action: "Mark ready" },
  { status: "ready", next: "collected", action: "Collected & paid" },
];

export default function StaffOrders({ loaderData }: Route.ComponentProps) {
  const { orders } = loaderData;
  const revalidator = useRevalidator();

  // Keep the board live so new orders appear without refreshing.
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible" && revalidator.state === "idle") {
        revalidator.revalidate();
      }
    }, 5000);
    return () => clearInterval(id);
  }, [revalidator]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {COLUMNS.map((col) => {
        const list = orders.filter((o) => o.status === col.status);
        return (
          <section key={col.status} className="rounded-2xl bg-gray-100 p-3 dark:bg-gray-900">
            <h2 className="mb-3 flex items-center justify-between px-1 font-bold">
              {STATUS_LABELS[col.status]}
              <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[col.status]}`}>
                {list.length}
              </span>
            </h2>
            <div className="space-y-3">
              {list.length === 0 && (
                <p className="px-1 py-6 text-center text-sm text-gray-400">Nothing here</p>
              )}
              {list.map((order) => (
                <OrderCard key={order.id} order={order} next={col.next} actionLabel={col.action} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function OrderCard({
  order,
  next,
  actionLabel,
}: {
  order: Order;
  next?: OrderStatus;
  actionLabel?: string;
}) {
  const fetcher = useFetcher();
  const busy = fetcher.state !== "idle";
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <article
      className={`rounded-xl bg-white p-4 shadow-sm transition dark:bg-gray-800 ${
        busy ? "opacity-50" : ""
      }`}
    >
      <header className="flex items-baseline justify-between">
        <p className="font-mono text-2xl font-black tracking-wider">#{order.code}</p>
        <p className="text-sm text-gray-500">{formatTime(order.createdAt)}</p>
      </header>
      <p className="font-semibold">{order.customerName}</p>

      <ul className="mt-3 space-y-1 text-sm">
        {order.items.map((item) => (
          <li key={item.productId} className="flex gap-2">
            <span aria-hidden>{item.emoji}</span>
            <span className="font-semibold tabular-nums">{item.quantity}×</span>
            <span className="flex-1">{item.name}</span>
          </li>
        ))}
      </ul>
      {order.note && (
        <p className="mt-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          📝 {order.note}
        </p>
      )}
      <p className="mt-3 flex justify-between border-t border-gray-100 pt-2 text-sm dark:border-gray-700">
        <span className="text-gray-500">{itemCount} items</span>
        <span className="font-bold">{formatPrice(order.totalCents)}</span>
      </p>

      <fetcher.Form method="post" className="mt-3 flex gap-2">
        <input type="hidden" name="orderId" value={order.id} />
        {next && (
          <button
            name="status"
            value={next}
            disabled={busy}
            className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            {actionLabel}
          </button>
        )}
        <button
          name="status"
          value="cancelled"
          disabled={busy}
          onClick={(e) => {
            if (!confirm(`Cancel order #${order.code}? Items go back into stock.`)) {
              e.preventDefault();
            }
          }}
          className="rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
        >
          Cancel
        </button>
      </fetcher.Form>
    </article>
  );
}
