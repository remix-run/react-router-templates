import { Outlet } from "react-router";
import { Header } from "./header";

import "./styles.css";

export { ErrorBoundary } from "./client";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </head>
      <body className="font-sans antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}

export default function Component() {
  return <Outlet />;
}
