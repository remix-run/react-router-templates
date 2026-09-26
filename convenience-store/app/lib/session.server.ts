import { createCookieSessionStorage, redirect } from "react-router";

import { env } from "./env.server";
import { MAX_PER_ITEM } from "./format";

// ---------------------------------------------------------------------------
// Customer cart: { [productId]: quantity } kept in a signed cookie.
// ---------------------------------------------------------------------------

export type Cart = Record<string, number>;

const cartStorage = createCookieSessionStorage<{ cart: Cart; lastOrder: string }>({
  cookie: {
    name: "__cart",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: env.cookieSecure,
    secrets: [env.sessionSecret],
    maxAge: 60 * 60 * 12,
  },
});

export async function getCartSession(request: Request) {
  const session = await cartStorage.getSession(request.headers.get("Cookie"));
  return {
    session,
    cart: (session.get("cart") ?? {}) as Cart,
    lastOrder: session.get("lastOrder") as string | undefined,
    commit: () => cartStorage.commitSession(session),
  };
}

export function setCartQuantity(cart: Cart, productId: number, quantity: number): Cart {
  const next = { ...cart };
  const qty = Math.max(0, Math.min(MAX_PER_ITEM, Math.floor(quantity)));
  if (qty === 0) delete next[productId];
  else next[productId] = qty;
  return next;
}

export function cartCount(cart: Cart) {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

// ---------------------------------------------------------------------------
// Staff login: a single shared password (STAFF_PASSWORD).
// ---------------------------------------------------------------------------

const staffStorage = createCookieSessionStorage<{ staff: boolean }>({
  cookie: {
    name: "__staff",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: env.cookieSecure,
    secrets: [env.sessionSecret],
    maxAge: 60 * 60 * 12,
  },
});

export async function isStaff(request: Request) {
  const session = await staffStorage.getSession(request.headers.get("Cookie"));
  return session.get("staff") === true;
}

export async function requireStaff(request: Request) {
  if (!(await isStaff(request))) {
    const url = new URL(request.url);
    throw redirect(`/staff/login?redirectTo=${encodeURIComponent(url.pathname)}`);
  }
}

export async function logInStaff(redirectTo: string) {
  const session = await staffStorage.getSession();
  session.set("staff", true);
  return redirect(redirectTo, {
    headers: { "Set-Cookie": await staffStorage.commitSession(session) },
  });
}

export async function logOutStaff(request: Request) {
  const session = await staffStorage.getSession(request.headers.get("Cookie"));
  return redirect("/staff/login", {
    headers: { "Set-Cookie": await staffStorage.destroySession(session) },
  });
}
