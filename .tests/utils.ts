import * as os from "node:os";
import { fileURLToPath } from "url";

import { test as playwrightTest } from "@playwright/test";
import {
  execa,
  ExecaError,
  Options,
  parseCommandString,
  ResultPromise,
} from "execa";
import fs from "fs-extra";
import getPort from "get-port";
import * as Path from "pathe";
import { Readable } from "stream";
import { ChildProcess } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const ROOT = Path.join(__filename, "../..");

const TMP = Path.join(os.tmpdir(), "react-router-templates.tests");

declare module "@playwright/test" {
  interface Page {
    errors: Error[];
  }
}

type Edit = (
  file: string,
  transform: (contents: string) => string
) => Promise<void>;

type Command = (
  command: string,
  options?: Pick<Options, "env" | "timeout">
) => ResultPromise<{ reject: false }>;

export const testTemplate = (template: string) =>
  playwrightTest.extend<{
    cwd: string;
    edit: Edit;
    port: number;
    $: Command;
  }>({
    page: async ({ page }, use) => {
      page.errors = [];
      page.on("pageerror", (error: Error) => page.errors.push(error));
      await use(page);
    },
    cwd: async ({}, use, testInfo) => {
      await fs.ensureDir(TMP);
      const cwd = await fs.mkdtemp(Path.join(TMP, template + "-"));

      if (fs.existsSync(cwd)) fs.rmSync(cwd, { recursive: true });
      await fs.mkdirp(cwd);

      fs.copySync(Path.join(ROOT, template), cwd, { errorOnExist: true });
      await execa({ cwd })`pnpm install --prefer-offline --ignore-workspace`;

      await use(cwd);

      const testPassed = testInfo.errors.length === 0;
      if (!testPassed) {
        console.log("cwd: ", cwd);
        return;
      }
      fs.rmSync(cwd, { recursive: true });
    },
    edit: async ({ cwd }, use) => {
      await use(async (file, transform) => {
        let filepath = Path.join(cwd, file);
        let contents = fs.readFileSync(filepath, "utf8");
        return fs.writeFileSync(filepath, transform(contents), "utf8");
      });
    },
    port: async ({}, use) => {
      const port = await getPort();
      await use(port);
    },
    $: async ({ cwd }, use) => {
      const spawn = execa({
        cwd,
        env: {
          NO_COLOR: "1",
          FORCE_COLOR: "0",
        },
        reject: false,
      });

      let testHasEnded = false;
      const processes: Array<ResultPromise> = [];
      await use((command, options = {}) => {
        const [file, ...args] = parseCommandString(command);
        const p = spawn(file, args, options);
        p.then((result) => {
          if (!(result instanceof Error)) return result;
          const expectedError = testHasEnded && result instanceof ExecaError;
          if (expectedError) return result;
          throw result;
        });
        if (p instanceof ChildProcess) {
          processes.push(p);
        }
        return p;
      });
      testHasEnded = true;

      processes.forEach((p) => p.kill());
      await Promise.all(processes);
    },
  });

export function matchLine(
  stream: Readable,
  pattern: RegExp,
  options: { timeout?: number } = {}
) {
  // Prepare error outside of promise so that stacktrace points to caller of `matchLine`
  const timeout = new Error(`Timed out - Could not find pattern: ${pattern}`);
  return new Promise<string>(async (resolve, reject) => {
    setTimeout(() => reject(timeout), options.timeout ?? 20_000);
    stream.on("data", (data) => {
      const line = data.toString();
      const matches = line.match(pattern);
      if (matches) resolve(matches[1]);
    });
  });
}

const urlMatch = ({ prefix }: { prefix: RegExp }) =>
  new RegExp(`${prefix.source}(${/http:\/\/\S+/.source})`);
export const urlRegex = {
  viteDev: urlMatch({ prefix: /Local:\s+/ }),
  reactRouterServe: urlMatch({ prefix: /\[react-router-serve\]\s+/ }),
  custom: urlMatch({ prefix: /Server is running on / }),
  netlify: urlMatch({ prefix: /◈ Server now ready on / }),
  wrangler: urlMatch({ prefix: /Ready on / }),
};
