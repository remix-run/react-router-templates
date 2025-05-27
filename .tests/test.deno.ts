import { expect, Page } from "@playwright/test";
import getPort from "get-port";

import { matchLine, testTemplate, urlRegex } from "./utils";

const test = testTemplate("deno", "deno install");

test("typecheck", async ({ $ }) => {
  await $(`deno task typecheck`);
});

test("dev", async ({ page, $ }) => {
  const port = await getPort();
  const dev = $(`deno task dev --port ${port}`);

  const url = await matchLine(dev.stdout, urlRegex.viteDev);

  await workflow({ page, url });
  const [, ...restLines] = dev.buffer.stderr.split("\n");
  expect(restLines.join("\n")).toBe("");
});

test("build + start", async ({ page, $ }) => {
  await $(`deno task build`);

  const port = await getPort();
  const start = $(`deno task start`, { env: { PORT: String(port) } });

  const url = await matchLine(start.stderr, urlRegex.deno);
  const localURL = new URL(url);
  localURL.hostname = "localhost";

  await workflow({ page, url: localURL.href });
  const [, ...restLines] = start.buffer.stderr.split("\n");
  expect(restLines.join("\n")).toBe(
    `Listening on ${url} (${localURL})\n`,
  );
});

async function workflow({ page, url }: { page: Page; url: string }) {
  await page.goto(url);
  await page.getByRole("link", { name: "React Router Docs" }).waitFor();
  await page.getByRole("link", { name: "Join Discord" }).waitFor();
  await expect(page).toHaveTitle(/New React Router App/);
  expect(page.errors).toStrictEqual([]);
}
