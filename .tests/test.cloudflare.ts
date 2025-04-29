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
  const ignoredLines = [
    /Default inspector port \d{4} not available, using \d{4} instead/,
  ];
  const filteredStderr = dev.buffer.stderr
    .split("\n")
    .filter(
      (line) =>
        line && !ignoredLines.some((ignoredLine) => ignoredLine.test(line)),
    )
    .join("\n");
  expect(filteredStderr).toBe("");
});

test("preview", async ({ page, $ }) => {
  const port = await getPort();
  const preview = $(`pnpm preview --port ${port}`);

  const url = await matchLine(preview.stdout, urlRegex.viteDev);
  await workflow({ page, url });

  const ignoredLines = [
    /The build was canceled/,
    /Error running vite-plugin-cloudflare:nodejs-compat on Tailwind CSS output\. Skipping\./,
    /Default inspector port \d{4} not available, using \d{4} instead/,
  ];
  const filteredStderr = preview.buffer.stderr
    .split("\n")
    .filter(
      (line) =>
        line && !ignoredLines.some((ignoredLine) => ignoredLine.test(line)),
    )
    .join("\n");
  expect(filteredStderr).toBe("");
});

async function workflow({ page, url }: { page: Page; url: string }) {
  await page.goto(url);
  await expect(page).toHaveTitle(/New React Router App/);
  await page.getByRole("link", { name: "React Router Docs" }).waitFor();
  await page.getByRole("link", { name: "Join Discord" }).waitFor();
  expect(page.errors).toStrictEqual([]);
}
