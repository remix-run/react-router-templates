import { expect, Page } from "@playwright/test";
import getPort from "get-port";

import {
  matchLine,
  testTemplate,
  urlRegex,
  withoutHmrPortError,
} from "./utils";

const test = testTemplate("netlify");

test("typecheck", async ({ $ }) => {
  await $(`pnpm typecheck`);
});

test("dev", async ({ page, $ }) => {
  const port = await getPort();
  const dev = $(`pnpm dev`, { env: { PORT: String(port) } });

  const url = await matchLine(dev.stdout, urlRegex.custom);
  await workflow({ page, url });
  expect(withoutHmrPortError(dev.buffer.stderr)).toBe("");
});

test("build", async ({ $ }) => {
  await $(`pnpm build`);
});

// For some reason, `netlify serve` can't find our `build` script 🤷
// This happens when running the template within this monorepo, not just in tests
// It does not happen when the template is initialized via `pnpm create react-router --template`
test.skip("build + start", async ({ page, edit, $ }) => {
  await edit("netlify.toml", (txt) =>
    txt
      .replaceAll("[dev]", "[dev]\nautoLaunch = false")
      .replaceAll("npm run", "pnpm"),
  );

  const port1 = await getPort();
  const port2 = await getPort();
  const port3 = await getPort();
  const start = $(
    `pnpm start --port ${port1} --functionsPort ${port2} --staticServerPort ${port3}`,
  );

  const url = await matchLine(start.stdout, urlRegex.netlify);
  await workflow({ page, url });
  expect(start.buffer.stderr).toBe("");
});

// Helper function to filter out expected WebSocket errors
function filterExpectedErrors(errors: Error[]) {
  return errors.filter(
    (error) =>
      !error.message.includes("WebSocket closed without opened") &&
      !error.message.includes("WebSocket server error"),
  );
}

async function workflow({ page, url }: { page: Page; url: string }) {
  await page.goto(url);
  await expect(page).toHaveTitle(/New React Router App/);
  await page.getByRole("link", { name: "React Router Docs" }).waitFor();
  await page.getByRole("link", { name: "Join Discord" }).waitFor();
  expect(filterExpectedErrors(page.errors)).toStrictEqual([]);
}
