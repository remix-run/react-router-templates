import { expect, Page } from "@playwright/test";
import getPort from "get-port";

import { matchLine, testTemplate, urlRegex } from "./utils";

const test = testTemplate("unstable_rsc-data-mode-vite");

test("typecheck", async ({ $ }) => {
  await $(`pnpm typecheck`);
});

test("dev", async ({ page, $ }) => {
  const port = await getPort();
  const dev = $(`pnpm dev --port ${port}`);

  const url = await matchLine(dev.stdout, urlRegex.viteDev);
  await workflow({ page, url });
});

test("build + start", async ({ page, $ }) => {
  await $(`pnpm build`);

  const port = await getPort();
  const start = $(`pnpm start`, { env: { PORT: String(port) } });

  const url = await matchLine(
    start.stdout,
    /Server listening on port \d+ \((http:\/\/localhost:\d+)\)/,
  );
  await workflow({ page, url });
});

async function workflow({ page, url }: { page: Page; url: string }) {
  await page.goto(url);
  await page.getByText("Welcome to React Router RSC").waitFor();
  await page
    .getByText(
      "This is a simple example of a React Router application using React Server Components (RSC) with Vite",
    )
    .waitFor();
  expect(page.errors).toStrictEqual([]);
}

