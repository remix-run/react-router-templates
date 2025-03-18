import { expect, Page } from "@playwright/test";
import getPort from "get-port";

import { matchLine, testTemplate, urlRegex } from "./utils";

const test = testTemplate("cloudflare");

test("typecheck", async ({ $ }) => {
  await $(`pnpm typecheck`);
});

test("dev", async ({ page, $ }) => {
  const port = await getPort();
  const dev = $(`pnpm dev --port ${port}`);

  const url = await matchLine(dev.stdout, urlRegex.viteDev);
  await workflow({ page, url });
  expect(dev.buffer.stderr).toBe("");
});

test("build + start", async ({ page, $ }) => {
  await $(`pnpm build`);

  const port1 = await getPort();
  const port2 = await getPort();
  const start = $(`pnpm start --port ${port1} --inspector-port ${port2}`);

  const url = await matchLine(start.stdout, urlRegex.wrangler);
  await workflow({ page, url });

  const ignoredLines = [
    "The version of Wrangler you are using is now out-of-date",
    "Please update to the latest version to prevent critical errors",
    "Run `npm install --save-dev wrangler@4` to update to the latest version",
    "After installation, run Wrangler with `npx wrangler`"
  ];
  const filteredStderr = start.buffer.stderr
    .split("\n")
    .filter(line => !ignoredLines.some(ignoredLine => line.includes(ignoredLine)))
    .join("\n")
    .trim();
  expect(filteredStderr).toBe("");
});

async function workflow({ page, url }: { page: Page; url: string }) {
  await page.goto(url);
  await expect(page).toHaveTitle(/New React Router App/);
  await page.getByRole("link", { name: "React Router Docs" }).waitFor();
  await page.getByRole("link", { name: "Join Discord" }).waitFor();
  expect(page.errors).toStrictEqual([]);
}
