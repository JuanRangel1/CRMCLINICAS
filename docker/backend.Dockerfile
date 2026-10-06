FROM node:24-alpine
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm prisma generate
RUN pnpm --filter backend build
EXPOSE 3001
CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm --filter backend start"]
