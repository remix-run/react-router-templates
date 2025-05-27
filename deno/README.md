# Welcome to React Router!

A modern, production-ready template for building full-stack React applications
using React Router.

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
deno install
```

### Development

Start the development server with HMR:

```bash
deno task dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
deno task build
```

## Deployment

### Deno Deploy

After running a build, deploy to https://deno.com/deploy with the following command:

```bash
deno run -A jsr:@deno/deployctl deploy --entrypoint server.ts
```

### DIY Deployment

If you're familiar with deploying Deno applications, the built-in app server is
production-ready.

Make sure to deploy the output of `deno task build`

```
├── deno.jsonc
├── deno.lock
├── server.ts
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already
configured for a simple default starting experience. You can use whatever CSS
framework you prefer.

---

Built with ❤️ using React Router.
