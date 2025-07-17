FROM node:20-alpine AS base
USER node
WORKDIR /app
COPY ./package.json package-lock.json /app/

FROM base AS staging
RUN npm ci
COPY . /app/
# Build app and prepare `node_modules` for production
# This second install will remove the omitted deps automatically
RUN npm run build \
	&& npm ci --omit=dev

FROM base
COPY --from=staging /app/node_modules /app/node_modules
COPY --from=staging /app/build /app/build
CMD ["npm", "run", "start"]
