# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 💾 PostgreSQL + DrizzleORM
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Choose your preferred package manager and run one of the following commands:

```bash
# Using npm
npm install

# Using pnpm
pnpm install

# Using Bun
bun install
```

### Development

Copy `.env.example` to `.env` and provide a `DATABASE_URL` with your connection string.

Run an initial database migration:

```bash
# Using npm
npm run db:migrate

# Using pnpm
pnpm db:migrate

# Using Bun
bun run db:migrate
```

Start the development server with HMR:

```bash
# Using npm
npm run dev

# Using pnpm
pnpm dev

# Using Bun
bun dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
# Using npm
npm run build

# Using pnpm
pnpm build

# Using Bun
bun run build
```

## Deployment

### Docker Deployment

This template includes three Dockerfiles optimized for different package managers:

- `Dockerfile` - for npm
- `Dockerfile.pnpm` - for pnpm
- `Dockerfile.bun` - for bun

To build and run using Docker:

```bash
# For npm
docker build -t my-app .

# For pnpm
docker build -f Dockerfile.pnpm -t my-app .

# For bun
docker build -f Dockerfile.bun -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── server.js
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.