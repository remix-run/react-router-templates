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
import * as Path from "pathe";
import { Readable } from "stream";
import { ChildProcess } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const ROOT = Path.join(__filename, "../..");
const TMP = Path.join(ROOT, ".tests/tmp");

declare module "@playwright/test" {
  interface Page {
    errors: Error[];
  }
}

type Edit = (
  file: string,
  transform: (contents: string) => string,
) => Promise<void>;

type Command = (
  command: string,
  options?: Pick<Options, "env" | "timeout">,
) => ResultPromise<{ reject: false }> & {
  buffer: { stdout: string; stderr: string };
};

export const testTemplate = (template: string, installCommand?: string) =>
  playwrightTest.extend<{
    cwd: string;
    edit: Edit;
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
      await fs.mkdirp(cwd);

      const templatePath = Path.join(ROOT, template);
      const nodeModulesPath = Path.join(templatePath, "node_modules");
      fs.copySync(templatePath, cwd, {
        errorOnExist: true,
        filter: (src) => Path.normalize(src) !== nodeModulesPath,
      });

      if (installCommand) {
        const spawn = execa({
          cwd,
          env: {
            NO_COLOR: "1",
            FORCE_COLOR: "0",
          },
          reject: false,
        });

        const [file, ...args] = parseCommandString(installCommand);

        await spawn(file, args);
      } else {
        fs.symlinkSync(nodeModulesPath, Path.join(cwd, "node_modules"));
      }

      await use(cwd);

      const testPassed = testInfo.errors.length === 0;
      if (!testPassed) console.log("cwd: ", cwd);
    },
    edit: async ({ cwd }, use) => {
      await use(async (file, transform) => {
        let filepath = Path.join(cwd, file);
        let contents = fs.readFileSync(filepath, "utf8");
        return fs.writeFileSync(filepath, transform(contents), "utf8");
      });
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
        if (p instanceof ChildProcess) {
          processes.push(p);
        }

        p.then((result) => {
          if (!(result instanceof Error)) return result;

          // Once the test has ended, this process will be killed as part of its teardown resulting in an ExecaError.
          // We only care about surfacing errors that occurred during test execution, not during teardown.
          const expectedError = testHasEnded && result instanceof ExecaError;
          if (expectedError) return result;

          throw result;
        });

        const buffer = { stdout: "", stderr: "" };
        p.stdout.on("data", (data) => (buffer.stdout += data.toString()));
        p.stderr.on("data", (data) => (buffer.stderr += data.toString()));
        return Object.assign(p, { buffer });
      });

      testHasEnded = true;
      processes.forEach((p) => p.kill());
    },
  });

export function matchLine(
  stream: Readable,
  pattern: RegExp,
  options: { timeout?: number } = {},
) {
  // Prepare error outside of promise so that stacktrace points to caller of `matchLine`
  const timeout = new Error(`Timed out - Could not find pattern: ${pattern}`);
  return new Promise<string>(async (resolve, reject) => {
    setTimeout(() => reject(timeout), options.timeout ?? 10_000);
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
  deno: urlMatch({ prefix: /Listening on / }),
  netlify: urlMatch({ prefix: /◈ Server now ready on / }),
  wrangler: urlMatch({ prefix: /Ready on / }),
};

// `vite.createServer` always tries to use the same HMR port
// unless `server.hmr.port` is configured.
// Ultimately, we should provide better primitives for building custom servers
// something like `createRequestHandler(pathToBuild)`.
export const withoutHmrPortError = (stderr: string) =>
  stderr
    .replace(/WebSocket server error: Port \d+ is already in use/, "")
    .trim();
