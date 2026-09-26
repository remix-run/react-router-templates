import { createHash, timingSafeEqual } from "node:crypto";
import { data, Form, redirect } from "react-router";

import { env } from "~/lib/env.server";
import { isStaff, logInStaff } from "~/lib/session.server";
import type { Route } from "./+types/login";

export function meta() {
  return [{ title: "Staff login" }];
}

function safeRedirect(to: FormDataEntryValue | null) {
  const value = typeof to === "string" ? to : "";
  return value.startsWith("/staff") && !value.startsWith("//") ? value : "/staff";
}

export async function loader({ request }: Route.LoaderArgs) {
  if (await isStaff(request)) throw redirect("/staff");
  const url = new URL(request.url);
  return { redirectTo: safeRedirect(url.searchParams.get("redirectTo")) };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");

  // Compare hashes so the check takes the same time for any input.
  const hash = (s: string) => createHash("sha256").update(s).digest();
  if (!timingSafeEqual(hash(password), hash(env.staffPassword))) {
    return data({ error: "Wrong password." }, { status: 401 });
  }
  return logInStaff(safeRedirect(form.get("redirectTo")));
}

export default function Login({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Form
        method="post"
        className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-900"
      >
        <h1 className="text-2xl font-bold">Staff login</h1>
        <input type="hidden" name="redirectTo" value={loaderData.redirectTo} />
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            name="password"
            required
            autoFocus
            autoComplete="current-password"
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-gray-700 dark:bg-gray-950"
          />
        </label>
        {actionData?.error && (
          <p role="alert" className="text-sm text-rose-600">
            {actionData.error}
          </p>
        )}
        <button className="w-full rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900">
          Log in
        </button>
      </Form>
    </main>
  );
}
