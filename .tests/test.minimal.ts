import { expect, Page } from "@playwright/test";
import getPort from "get-port";

import { matchLine, testTemplate, urlRegex } from "./utils";

const test = testTemplate("minimal");

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

  const port = await getPort();
  const start = $(`pnpm start`, { env: { PORT: String(port) } });

  const url = await matchLine(start.stdout, urlRegex.reactRouterServe);
  await workflow({ page, url });
  expect(start.buffer.stderr).toBe("");
});

async function workflow({ page, url }: { page: Page; url: string }) {
  await page.goto(url);
  await page.getByRole("heading", { name: "Hello, React Router" }).waitFor();
  await page.getByRole("link", { name: "React Router Docs" }).waitFor();
  expect(page.errors).toStrictEqual([]);
}
