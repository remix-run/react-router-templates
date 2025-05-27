import type { Route } from "./+types/home.ts";
import { Welcome } from "../welcome/welcome.tsx";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export function loader() {
  return {
    denoVersion: Deno.version.deno,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Welcome denoVersion={loaderData.denoVersion} />;
}
