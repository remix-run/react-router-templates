import { useFetcher } from "react-router";

// Adds/removes a product from the basket. Posts to the /cart action, so it
// works from any page and still works without JavaScript.
export function QuantityStepper({
  productId,
  quantity,
  max,
  productName,
}: {
  productId: number;
  quantity: number;
  max: number;
  productName: string;
}) {
  const fetcher = useFetcher();

  // Optimistic UI: show the quantity we just asked for.
  const pending = fetcher.formData?.get("quantity");
  const shown = pending != null ? Number(pending) : quantity;

  if (shown === 0) {
    return (
      <fetcher.Form method="post" action="/cart">
        <input type="hidden" name="intent" value="set" />
        <input type="hidden" name="productId" value={productId} />
        <button
          name="quantity"
          value={1}
          disabled={max < 1}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-700"
        >
          {max < 1 ? "Sold out" : "Add to basket"}
        </button>
      </fetcher.Form>
    );
  }

  return (
    <fetcher.Form
      method="post"
      action="/cart"
      className="flex items-center justify-between rounded-xl bg-emerald-50 p-1 dark:bg-emerald-950"
    >
      <input type="hidden" name="intent" value="set" />
      <input type="hidden" name="productId" value={productId} />
      <button
        name="quantity"
        value={shown - 1}
        aria-label={`Remove one ${productName}`}
        className="h-11 w-11 rounded-lg bg-white text-xl font-bold text-emerald-700 shadow-sm active:scale-95 dark:bg-gray-900 dark:text-emerald-300"
      >
        −
      </button>
      <span className="text-lg font-semibold tabular-nums" aria-live="polite">
        {shown}
      </span>
      <button
        name="quantity"
        value={shown + 1}
        disabled={shown >= max}
        aria-label={`Add one more ${productName}`}
        className="h-11 w-11 rounded-lg bg-white text-xl font-bold text-emerald-700 shadow-sm active:scale-95 disabled:opacity-40 dark:bg-gray-900 dark:text-emerald-300"
      >
        +
      </button>
    </fetcher.Form>
  );
}
