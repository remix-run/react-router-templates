"use server-entry";

import type { unstable_RSCRouteConfig as RSCRouteConfig } from "react-router";

import "./entry.client";

export function routes() {
  return [
    {
      id: "root",
      path: "",
      lazy: () => import("./routes/root/route"),
      children: [
        {
          id: "home",
          index: true,
          lazy: () => import("./routes/home/route"),
        },
        {
          id: "about",
          path: "about",
          lazy: () => import("./routes/about/route"),
        },
      ],
    },
  ] satisfies RSCRouteConfig;
}
