FROM node:24-alpine
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter frontend build
EXPOSE 3000
CMD ["pnpm", "--filter", "frontend", "start"]
