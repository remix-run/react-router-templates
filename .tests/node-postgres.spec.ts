import { testTemplate } from "./utils";

const test = testTemplate("node-postgres");

test("typecheck", async ({ $ }) => {
  await $(`pnpm typecheck`);
});
