# syntax=docker/dockerfile:1.7

##############################
# Builder
##############################
FROM oven/bun:1.2 AS builder

WORKDIR /app

COPY package.json bun.lock ./

RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*
RUN mkdir -p /data
RUN bun install --frozen-lockfile

COPY . .

# RUN bun run build
# compile to the binary for better performance and smaller image size
RUN bun run build:binary

##############################
# Runtime
##############################
FROM oven/bun:1.2

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/public ./public
COPY --from=builder /app/drizzle ./drizzle

RUN mkdir -p /data && chown -R 65532:65532 /data /app

EXPOSE 3000

USER 65532:65532

ENV DATABASE_URL=/data/auth.sqlite

ENTRYPOINT ["./frontend-app"]