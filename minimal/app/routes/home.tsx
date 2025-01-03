import type { Route } from "./+types/home";

export function loader() {
  return { name: "React Router" };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <h1>Hello {loaderData.name}</h1>;
}
