# React Router Templates

![React Router Templates](./.assets/starter-kits-solid.png)

You can quickly create a new React Router application from any of these templates using the `create-react-router` CLI.

```bash
npx create-react-router@latest --template remix-run/react-router-templates/<template-name>
```

## Contributing

If you find a bug or want to make an improvement to one of the templates, please [create an issue](https://github.com/remix-run/react-router-templates/issues/new) or [create a PR](https://github.com/remix-run/react-router-templates/pulls).

### Contributing a new template

We intend to keep the number of templates in this repository to a minimum, and so will unlikely accept any new templates. The goal is for these templates to be a good starting point for many projects, as well as other community templates.

If you have a template you have developed and maintain, please submit a PR to add it to the [list below](#community-templates).

## Questions

If you have a question about React Router please open up a discussion on [GitHub Discussions](https://github.com/remix-run/react-router/discussions) or reach out on [Discord](https://rmx.as/discord).

## Templates

### Official Templates

The following templates are maintained by the React Router team. For more information on each template, checkout out the README of the template repository.

**Default template:**

A full-featured production-ready template with server-side rendering, TypeScript, TailwindCSS, and Docker support. Perfect for building scalable applications with built-in asset optimization and hot module replacement.

```bash
npx create-react-router@latest
```

**Minimal template:**

A lightweight template used for https://reactrouter.com/new. Designed for experimentation and demo applications. Not recommended for production use, but ideal for learning React Router's core concepts or creating reproductions.

```bash
npx create-react-router@latest --template remix-run/react-router-templates/minimal
```

**JavaScript only template:**

A TypeScript-free version of the default template, offering the same production-ready features but without type checking. Great for teams preferring plain JavaScript.

```bash
npx create-react-router@latest --template remix-run/react-router-templates/javascript
```

**Node custom server template:**

Extends the default template with a customizable Node.js server implementation, giving you full control over server configuration and middleware.

```bash
npx create-react-router@latest --template remix-run/react-router-templates/node-custom-server
```

**Node PostgreSQL template:**

Adds PostgreSQL database support with DrizzleORM to the default template, including database migrations and type-safe queries.

```bash
npx create-react-router@latest --template remix-run/react-router-templates/node-postgres
```

**Cloudflare template:**

Optimized for Cloudflare's edge platform with built-in deployment workflows using Wrangler CLI. Includes preview deployments and progressive rollouts.

```bash
npx create-react-router@latest --template remix-run/react-router-templates/cloudflare
```

**Cloudflare with D1 template:**

Extends the Cloudflare template with D1 database support, including migrations and production database setup. Perfect for edge-first applications with persistent data.

```bash
npx create-react-router@latest --template remix-run/react-router-templates/cloudflare-d1
```

**Vercel template:**

Pre-configured for Vercel deployment with optimized serverless functions and edge caching. Includes one-click deployment to Vercel's platform.

```bash
npx create-react-router@latest --template remix-run/react-router-templates/vercel
```

**Netlify template:**

Ready for Netlify deployment with serverless functions and edge caching. Features one-click deployment to Netlify's platform.

```bash
npx create-react-router@latest --template remix-run/react-router-templates/netlify
```

### Community Templates

The following templates are maintained by the community. For more information on each template, checkout out the README of the template repository.

If you have a template you have developed and maintain, please submit a PR to add it.

- [Epic Stack](https://github.com/epicweb-dev/epic-stack) - An opinionated project starter and reference that allows teams to ship their ideas to production faster and on a more stable foundation based on the experience of Kent C. Dodds and contributors.

- [Edge-first Starter Kit](https://github.com/edgefirst-dev/starter) - A full-stack starter kit for Edge-first applications built with React on top of Cloudflare Developer Platform.

- [react-router-nest](https://github.com/cbnsndwch/react-router-nest) - React Router 7 x NestJS custom server template for Turbo + PNPM monorepos.

- [Forge 42 base-stack](https://github.com/forge-42/base-stack) - A comprehensive React Router 7 template with React 19, TypeScript, TailwindCSS, Vite, Hono server, and built-in tools for testing, i18n, SEO, and development workflow.

- [React Router with Mantine](https://github.com/samui-build/react-router-mantine) - React Router 7 default template but with [Mantine](https://mantine.dev) instead of TailwindCSS.

- [VITE-SHADCN](https://github.com/yluiop123/vite-shadcn) - a Shadcn Admin UI built with React Router 7 and Shadcn, Vite, React, Zustand.
  
- [React Router with Material UI](https://github.com/mui/material-ui/tree/master/examples/material-ui-react-router-ts) - React Router 7 with [Material UI 7](https://mui.com/material-ui/getting-started/).
