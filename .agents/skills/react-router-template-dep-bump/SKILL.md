---
name: react-router-template-dep-bump
description: Update pinned react-router and @react-router package versions in the remix-run/react-router-templates repo, refresh the pnpm lockfile, and verify with the Playwright suite in .tests.
---

# React Router Template Dep Bump

Use this when updating React Router dependencies in `react-router-templates`.

Run these commands from the repo root.

## 1. Confirm the current pins

```sh
rg -n 'react-router|@react-router' --glob 'package.json' .
```

## 2. Resolve the latest published React Router versions

```sh
pnpm view react-router version
pnpm view <currently-used-@react-router-package> version
```

Run the second command once for each `@react-router/*` package currently used in the template `package.json` files from step 1. Use the shared latest version across that family when they match.

## 3. Update the pinned versions in every affected template

Update all matching `package.json` entries for `react-router` and every currently used `@react-router/*` dependency.

Check the touched files with:

```sh
git diff --name-only
```

## 4. Refresh the lockfile

```sh
pnpm install
```

## 5. Run the Playwright tests

Install the browser if needed:

```sh
pnpm --dir .tests playwright install chromium
```

Then run the suite:

```sh
pnpm --dir .tests test
```

If Chromium fails to launch with a macOS sandbox error like `MachPortRendezvousServer ... Permission denied`, rerun the same test command outside the sandbox or with elevated permissions.

## 6. Sanity check the diff

```sh
git status --short
git diff --stat
```

Expected result:
- template `package.json` files updated to one React Router version
- `pnpm-lock.yaml` refreshed
- `pnpm --dir .tests test` passes

## 7. Report other outdated packages

After the React Router bump is complete and tests pass, run:

```sh
pnpm outdated -r --format json
```

Reply with the remaining outdated packages grouped by update type:
- major
- minor
- patch

Then ask whether the user wants to update any of those packages next.
