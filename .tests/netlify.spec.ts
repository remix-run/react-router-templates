import { expect, Page } from "@playwright/test";

import { matchLine, testTemplate, urlRegex } from "./utils";
import getPort from "get-port";

const test = testTemplate("netlify");

test("typecheck", async ({ $ }) => {
  await $(`pnpm typecheck`);
});

test("dev", async ({ page, $ }) => {
  const port = await getPort();
  const dev = $(`pnpm dev`, { env: { PORT: String(port) } });
  const url = await matchLine(dev.stdout, urlRegex.custom);
  await workflow({ page, url });
});

test("build + start", async ({ page, edit, $ }) => {
  await edit("netlify.toml", (txt) =>
    txt
      .replaceAll("[dev]", "[dev]\nautoLaunch = false")
      .replaceAll("npm run", "pnpm")
  );

  const port1 = await getPort();
  const port2 = await getPort();
  const port3 = await getPort();
  const start = $(
    `pnpm start --port ${port1} --functionsPort ${port2} --staticServerPort ${port3}`
  );

  const url = await matchLine(start.stdout, urlRegex.netlify);
  await workflow({ page, url });
});

async function workflow({ page, url }: { page: Page; url: string }) {
  await page.goto(url);
  await expect(page).toHaveTitle(/New React Router App/);
  await page.getByRole("link", { name: "React Router Docs" }).waitFor();
  await page.getByRole("link", { name: "Join Discord" }).waitFor();
}
