import { expect, Page } from "@playwright/test";

import { matchLine, testTemplate, urlRegex } from "./utils";

const test = testTemplate("netlify");

test("typecheck", async ({ $ }) => {
  await $(`pnpm typecheck`);
});

test("dev", async ({ page, port, $ }) => {
  const dev = $(`pnpm dev`, { env: { PORT: String(port) } });
  const url = await matchLine(dev.stdout, urlRegex.custom);
  await workflow({ page, url });
});

test("build + start", async ({ page, edit, port, $ }) => {
  await edit("netlify.toml", (txt) =>
    txt
      .replaceAll("[dev]", "[dev]\nautoLaunch = false")
      .replaceAll("npm run", "pnpm")
  );
  const start = $(`pnpm start --port ${port}`, { timeout: 20_000 });
  const url = await matchLine(start.stdout, urlRegex.netlify);
  await workflow({ page, url });
});

async function workflow({ page, url }: { page: Page; url: string }) {
  await page.goto(url);
  await expect(page).toHaveTitle(/New React Router App/);
  await page.getByRole("link", { name: "React Router Docs" }).waitFor();
  await page.getByRole("link", { name: "Join Discord" }).waitFor();
}
