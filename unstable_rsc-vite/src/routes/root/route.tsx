import { Outlet } from "react-router";

import "./styles.css";

export { ErrorBoundary, Layout } from "./client";

export default function Component() {
  return <Outlet />;
}
