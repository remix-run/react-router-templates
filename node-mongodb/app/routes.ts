import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/todos", "routes/todos/index.tsx"),
  route("/todos/new", "routes/todos/create.tsx"),
  route("/todos/:id/toggle", "routes/todos/toggle.tsx"),
  route("/todos/:id/delete", "routes/todos/delete.tsx"),
] satisfies RouteConfig;
