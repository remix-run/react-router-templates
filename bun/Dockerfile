FROM oven/bun:1-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN bun ci

FROM oven/bun:1-alpine AS production-dependencies-env
COPY ./package.json bun.lock /app/
WORKDIR /app
RUN bun ci --omit=dev

FROM oven/bun:1-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN bun run build

FROM oven/bun:1-alpine
COPY ./package.json bun.lock /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
COPY --from=build-env /app/server.ts /app/server.ts
WORKDIR /app
CMD ["bun", "--trace-uncaught", "--trace-warnings", "run", "/app/server.ts", "build/server/index.js"]
