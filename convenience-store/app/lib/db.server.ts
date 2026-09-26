import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

import { env } from "./env.server";
import { SEED_PRODUCTS } from "./seed";

export type Product = {
  id: number;
  name: string;
  description: string;
  category: string;
  emoji: string;
  priceCents: number;
  stock: number;
  active: boolean;
};

export type OrderStatus =
  | "new"
  | "picking"
  | "ready"
  | "collected"
  | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "picking",
  "ready",
  "collected",
  "cancelled",
];

export type OrderItem = {
  productId: number;
  name: string;
  emoji: string;
  priceCents: number;
  quantity: number;
};

export type Order = {
  id: number;
  code: string;
  customerName: string;
  note: string;
  status: OrderStatus;
  totalCents: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

declare global {
  // Reuse one connection across dev-server hot reloads.
  var __storeDb: DatabaseSync | undefined;
}

function open() {
  mkdirSync(dirname(env.databasePath), { recursive: true });
  const db = new DatabaseSync(env.databasePath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      category    TEXT    NOT NULL,
      emoji       TEXT    NOT NULL DEFAULT '🛒',
      price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
      stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      active      INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS orders (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      code          TEXT    NOT NULL UNIQUE,
      customer_name TEXT    NOT NULL,
      note          TEXT    NOT NULL DEFAULT '',
      status        TEXT    NOT NULL DEFAULT 'new',
      total_cents   INTEGER NOT NULL,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id  INTEGER NOT NULL REFERENCES products(id),
      name        TEXT    NOT NULL,
      emoji       TEXT    NOT NULL,
      price_cents INTEGER NOT NULL,
      quantity    INTEGER NOT NULL CHECK (quantity > 0)
    );

    CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
  `);

  const { count } = db
    .prepare("SELECT COUNT(*) AS count FROM products")
    .get() as { count: number };
  if (count === 0) {
    const insert = db.prepare(
      `INSERT INTO products (name, description, category, emoji, price_cents, stock)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );
    transaction(db, () => {
      for (const p of SEED_PRODUCTS) {
        insert.run(p.name, p.description, p.category, p.emoji, p.priceCents, p.stock);
      }
    });
  }
  return db;
}

function transaction<T>(db: DatabaseSync, fn: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

const db = (globalThis.__storeDb ??= open());

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

type ProductRow = {
  id: number;
  name: string;
  description: string;
  category: string;
  emoji: string;
  price_cents: number;
  stock: number;
  active: number;
};

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    emoji: row.emoji,
    priceCents: row.price_cents,
    stock: row.stock,
    active: row.active === 1,
  };
}

export function listProducts(opts: {
  q?: string;
  category?: string;
  includeInactive?: boolean;
} = {}): Product[] {
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (!opts.includeInactive) where.push("active = 1");
  if (opts.category) {
    where.push("category = ?");
    params.push(opts.category);
  }
  if (opts.q) {
    where.push("(name LIKE ? OR description LIKE ?)");
    params.push(`%${opts.q}%`, `%${opts.q}%`);
  }
  const sql = `SELECT * FROM products ${
    where.length ? `WHERE ${where.join(" AND ")}` : ""
  } ORDER BY category, name`;
  return (db.prepare(sql).all(...params) as ProductRow[]).map(toProduct);
}

export function listCategories(): string[] {
  return (
    db
      .prepare(
        "SELECT DISTINCT category FROM products WHERE active = 1 ORDER BY category",
      )
      .all() as { category: string }[]
  ).map((r) => r.category);
}

export function getProductsByIds(ids: number[]): Product[] {
  if (ids.length === 0) return [];
  const rows = db
    .prepare(
      `SELECT * FROM products WHERE id IN (${ids.map(() => "?").join(",")})`,
    )
    .all(...ids) as ProductRow[];
  return rows.map(toProduct);
}

export function createProduct(input: Omit<Product, "id" | "active">) {
  db.prepare(
    `INSERT INTO products (name, description, category, emoji, price_cents, stock)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    input.name,
    input.description,
    input.category,
    input.emoji,
    input.priceCents,
    input.stock,
  );
}

export function updateProduct(
  id: number,
  input: Pick<Product, "priceCents" | "stock" | "active">,
) {
  db.prepare(
    "UPDATE products SET price_cents = ?, stock = ?, active = ? WHERE id = ?",
  ).run(input.priceCents, input.stock, input.active ? 1 : 0, id);
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

type OrderRow = {
  id: number;
  code: string;
  customer_name: string;
  note: string;
  status: OrderStatus;
  total_cents: number;
  created_at: string;
  updated_at: string;
};

type OrderItemRow = {
  order_id: number;
  product_id: number;
  name: string;
  emoji: string;
  price_cents: number;
  quantity: number;
};

function hydrateOrders(rows: OrderRow[]): Order[] {
  if (rows.length === 0) return [];
  const items = db
    .prepare(
      `SELECT * FROM order_items WHERE order_id IN (${rows
        .map(() => "?")
        .join(",")})`,
    )
    .all(...rows.map((r) => r.id)) as OrderItemRow[];

  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    customerName: row.customer_name,
    note: row.note,
    status: row.status,
    totalCents: row.total_cents,
    // SQLite datetime('now') is UTC without a zone marker.
    createdAt: row.created_at.replace(" ", "T") + "Z",
    updatedAt: row.updated_at.replace(" ", "T") + "Z",
    items: items
      .filter((i) => i.order_id === row.id)
      .map((i) => ({
        productId: i.product_id,
        name: i.name,
        emoji: i.emoji,
        priceCents: i.price_cents,
        quantity: i.quantity,
      })),
  }));
}

export function getOrderByCode(code: string): Order | null {
  const row = db
    .prepare("SELECT * FROM orders WHERE code = ?")
    .get(code.toUpperCase()) as OrderRow | undefined;
  return row ? hydrateOrders([row])[0] : null;
}

export function listOrders(statuses: OrderStatus[]): Order[] {
  const rows = db
    .prepare(
      `SELECT * FROM orders WHERE status IN (${statuses
        .map(() => "?")
        .join(",")}) ORDER BY created_at ASC, id ASC LIMIT 200`,
    )
    .all(...statuses) as OrderRow[];
  return hydrateOrders(rows);
}

export class OutOfStockError extends Error {
  constructor(public products: string[]) {
    super(`Not enough stock for: ${products.join(", ")}`);
  }
}

// Short, easy-to-read pickup code without ambiguous characters (0/O, 1/I).
function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export function createOrder(input: {
  customerName: string;
  note: string;
  lines: { productId: number; quantity: number }[];
}): string {
  return transaction(db, () => {
    const products = getProductsByIds(input.lines.map((l) => l.productId));
    const byId = new Map(products.map((p) => [p.id, p]));

    const short: string[] = [];
    let total = 0;
    for (const line of input.lines) {
      const product = byId.get(line.productId);
      if (!product || !product.active || product.stock < line.quantity) {
        short.push(product?.name ?? `#${line.productId}`);
        continue;
      }
      total += product.priceCents * line.quantity;
    }
    if (short.length > 0) throw new OutOfStockError(short);

    let code = generateCode();
    const exists = db.prepare("SELECT 1 FROM orders WHERE code = ?");
    while (exists.get(code)) code = generateCode();

    const { lastInsertRowid } = db
      .prepare(
        "INSERT INTO orders (code, customer_name, note, total_cents) VALUES (?, ?, ?, ?)",
      )
      .run(code, input.customerName, input.note, total);

    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, name, emoji, price_cents, quantity)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );
    const takeStock = db.prepare(
      "UPDATE products SET stock = stock - ? WHERE id = ?",
    );
    for (const line of input.lines) {
      const p = byId.get(line.productId)!;
      insertItem.run(lastInsertRowid, p.id, p.name, p.emoji, p.priceCents, line.quantity);
      takeStock.run(line.quantity, p.id);
    }
    return code;
  });
}

export function setOrderStatus(id: number, status: OrderStatus) {
  transaction(db, () => {
    const current = db
      .prepare("SELECT status FROM orders WHERE id = ?")
      .get(id) as { status: OrderStatus } | undefined;
    // Cancelled orders are final (their stock has already been returned).
    if (!current || current.status === status || current.status === "cancelled") {
      return;
    }

    // Cancelling puts the items back on the shelf.
    if (status === "cancelled") {
      db.prepare(
        `UPDATE products SET stock = stock + (
           SELECT quantity FROM order_items
           WHERE order_items.order_id = ? AND order_items.product_id = products.id
         )
         WHERE id IN (SELECT product_id FROM order_items WHERE order_id = ?)`,
      ).run(id, id);
    }
    db.prepare(
      "UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?",
    ).run(status, id);
  });
}
