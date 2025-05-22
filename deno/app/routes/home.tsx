import type { Route } from "../../.react-router/types/app/routes/+types/home.ts";
import { Welcome } from "../welcome/welcome.tsx";
import { kv } from "../kv.ts";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  let name = formData.get("name");
  let email = formData.get("email");
  if (typeof name !== "string" || typeof email !== "string") {
    return { guestBookError: "Name and email are required" };
  }

  name = name.trim();
  email = email.trim();
  if (!name || !email) {
    return { guestBookError: "Name and email are required" };
  }

  try {
    await kv.set(["guest-book", email], { name, email });
  } catch {
    return { guestBookError: "Error adding to guest book" };
  }
}

export async function loader({}: Route.LoaderArgs) {
  const guestBook = (await Array.fromAsync(
    kv.list<{ name: string; email: string }>({ prefix: ["guest-book"] }),
  )).map((entry) => entry.value);

  return { guestBook };
}

export default function Home({ actionData, loaderData }: Route.ComponentProps) {
  return (
    <Welcome
      guestBook={loaderData.guestBook}
      guestBookError={actionData?.guestBookError}
    />
  );
}
