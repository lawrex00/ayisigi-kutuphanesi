FROM node:22-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_SITE_NAME="Ay Işığı Kütüphanesi"
ARG NEXT_PUBLIC_AUTHOR_NAME=Gozyasikullugu
ARG NEXT_PUBLIC_SITE_URL=https://ayisigi.fly.dev
ENV NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME
ENV NEXT_PUBLIC_AUTHOR_NAME=$NEXT_PUBLIC_AUTHOR_NAME
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

RUN mkdir -p /app/data/uploads && chown -R nextjs:nodejs /app/data

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Native module for SQLite (standalone may not bundle it correctly)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV SQLITE_PATH=/app/data/wattpad.db

CMD ["node", "server.js"]
