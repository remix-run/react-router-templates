// Most of a single item one customer can put in the basket.
export const MAX_PER_ITEM = 20;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatPrice(cents: number) {
  return currency.format(cents / 100);
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const STATUS_LABELS: Record<string, string> = {
  new: "Received",
  picking: "Being picked",
  ready: "Ready for pickup",
  collected: "Collected",
  cancelled: "Cancelled",
};

export const STATUS_STYLES: Record<string, string> = {
  new: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200",
  picking: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
  ready: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
  collected: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200",
};
