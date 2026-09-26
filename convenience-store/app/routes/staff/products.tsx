import { useEffect, useRef } from "react";
import { data, Form, useFetcher, useNavigation } from "react-router";

import {
  createProduct,
  listProducts,
  updateProduct,
  type Product,
} from "~/lib/db.server";
import { requireStaff } from "~/lib/session.server";
import type { Route } from "./+types/products";

export function meta() {
  return [{ title: "Products · Staff" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireStaff(request);
  return { products: listProducts({ includeInactive: true }) };
}

function parsePrice(value: FormDataEntryValue | null) {
  const n = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
}

function parseStock(value: FormDataEntryValue | null) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

export async function action({ request }: Route.ActionArgs) {
  await requireStaff(request);
  const form = await request.formData();
  const intent = form.get("intent");

  const priceCents = parsePrice(form.get("price"));
  const stock = parseStock(form.get("stock"));
  if (priceCents === null || stock === null) {
    return data({ error: "Price and stock must be positive numbers." }, { status: 400 });
  }

  if (intent === "update") {
    const id = Number(form.get("id"));
    if (!Number.isInteger(id)) throw data("Invalid id", { status: 400 });
    updateProduct(id, { priceCents, stock, active: form.get("active") === "on" });
    return { error: null };
  }

  if (intent === "create") {
    const name = String(form.get("name") ?? "").trim();
    const category = String(form.get("category") ?? "").trim();
    if (!name || !category) {
      return data({ error: "Name and category are required." }, { status: 400 });
    }
    createProduct({
      name: name.slice(0, 80),
      category: category.slice(0, 40),
      description: String(form.get("description") ?? "").trim().slice(0, 120),
      emoji: String(form.get("emoji") ?? "").trim().slice(0, 8) || "🛒",
      priceCents,
      stock,
    });
    return { error: null, created: true };
  }

  throw data("Unknown intent", { status: 400 });
}

const input =
  "rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-gray-700 dark:bg-gray-950";

export default function StaffProducts({ loaderData, actionData }: Route.ComponentProps) {
  const { products } = loaderData;
  const navigation = useNavigation();
  const createForm = useRef<HTMLFormElement>(null);
  const categories = [...new Set(products.map((p) => p.category))];

  useEffect(() => {
    if (navigation.state === "idle" && actionData && "created" in actionData) {
      createForm.current?.reset();
    }
  }, [navigation.state, actionData]);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900">
        <h2 className="mb-3 text-lg font-bold">Add a product</h2>
        <Form
          ref={createForm}
          method="post"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[4rem_1fr_1fr_1fr_6rem_5rem_auto]"
        >
          <input type="hidden" name="intent" value="create" />
          <input name="emoji" placeholder="🛒" aria-label="Emoji" className={`${input} text-center`} />
          <input name="name" required placeholder="Name" aria-label="Name" className={input} />
          <input
            name="category"
            required
            list="categories"
            placeholder="Category"
            aria-label="Category"
            className={input}
          />
          <datalist id="categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <input name="description" placeholder="Description" aria-label="Description" className={input} />
          <input
            name="price"
            required
            inputMode="decimal"
            placeholder="Price"
            aria-label="Price"
            className={input}
          />
          <input
            name="stock"
            required
            type="number"
            min={0}
            placeholder="Stock"
            aria-label="Stock"
            className={input}
          />
          <button className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">
            Add
          </button>
        </Form>
        {actionData?.error && (
          <p role="alert" className="mt-3 text-sm text-rose-600">
            {actionData.error}
          </p>
        )}
      </section>

      <section className="overflow-x-auto rounded-2xl bg-white shadow-sm dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-gray-500 dark:border-gray-800">
            <tr>
              <th className="p-3 font-medium">Product</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">Stock</th>
              <th className="p-3 font-medium">On sale</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {products.map((p) => (
              <ProductRow key={p.id} product={p} />
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function ProductRow({ product }: { product: Product }) {
  const fetcher = useFetcher<typeof action>();
  const formId = `product-${product.id}`;
  const saving = fetcher.state !== "idle";

  return (
    <tr className={product.active ? "" : "text-gray-400"}>
      <td className="p-3">
        <span className="mr-2 text-xl" aria-hidden>
          {product.emoji}
        </span>
        <span className="font-medium">{product.name}</span>
        {fetcher.data?.error && (
          <p className="text-xs text-rose-600">{fetcher.data.error}</p>
        )}
      </td>
      <td className="p-3">{product.category}</td>
      <td className="p-3">
        <input
          form={formId}
          name="price"
          inputMode="decimal"
          defaultValue={(product.priceCents / 100).toFixed(2)}
          aria-label={`${product.name} price`}
          className={`${input} w-24`}
        />
      </td>
      <td className="p-3">
        <input
          form={formId}
          name="stock"
          type="number"
          min={0}
          defaultValue={product.stock}
          aria-label={`${product.name} stock`}
          className={`${input} w-20 ${product.stock === 0 ? "border-rose-400" : ""}`}
        />
      </td>
      <td className="p-3">
        <input
          form={formId}
          name="active"
          type="checkbox"
          defaultChecked={product.active}
          aria-label={`${product.name} on sale`}
          className="h-5 w-5 accent-emerald-600"
        />
      </td>
      <td className="p-3 text-right">
        <fetcher.Form id={formId} method="post">
          <input type="hidden" name="intent" value="update" />
          <input type="hidden" name="id" value={product.id} />
          <button
            disabled={saving}
            className="rounded-lg bg-gray-900 px-3 py-1.5 font-semibold text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-white dark:text-gray-900"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </fetcher.Form>
      </td>
    </tr>
  );
}
