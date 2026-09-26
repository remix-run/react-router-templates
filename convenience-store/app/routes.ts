import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // Customer-facing store
  layout("routes/store-layout.tsx", [
    index("routes/catalog.tsx"),
    route("cart", "routes/cart.tsx"),
    route("order/:code", "routes/order.tsx"),
  ]),

  // Staff dashboard (password protected)
  route("staff/login", "routes/staff/login.tsx"),
  route("staff/logout", "routes/staff/logout.ts"),
  layout("routes/staff/layout.tsx", [
    route("staff", "routes/staff/orders.tsx"),
    route("staff/products", "routes/staff/products.tsx"),
  ]),

  // Health check for uptime monitors / Docker
  route("healthz", "routes/healthz.ts"),
] satisfies RouteConfig;
