# ============================
# Base image
# ============================
FROM oven/bun:1-alpine AS base
RUN apk add --no-cache dumb-init
WORKDIR /app
RUN addgroup -g 1001 -S appgroup \
    && adduser -S appuser -u 1001 -G appgroup \
    && chown -R appuser:appgroup /app

# ============================
# Dependencies stage
# ============================
FROM base AS deps
WORKDIR /app

# Copy root package files
COPY --chown=appuser:appgroup package.json bun.lockb* ./

# Copy only the packages we need
COPY --chown=appuser:appgroup packages/logger ./packages/logger
COPY --chown=appuser:appgroup packages/notifier ./packages/notifier
COPY --chown=appuser:appgroup packages/shared ./packages/shared
COPY --chown=appuser:appgroup packages/tokens ./packages/tokens
COPY --chown=appuser:appgroup packages/typescript-config ./packages/typescript-config

# Copy dex-monitor package.json for dependency resolution
COPY --chown=appuser:appgroup apps/dex-monitor/package.json ./apps/dex-monitor/

# Install all dependencies
RUN bun install --frozen-lockfile

# ============================
# Builder stage
# ============================
FROM base AS builder
WORKDIR /app

# Copy installed dependencies
COPY --from=deps --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=deps --chown=appuser:appgroup /app/packages ./packages

# Copy package files
COPY --chown=appuser:appgroup package.json bun.lockb* ./

# Copy dex-monitor source
COPY --chown=appuser:appgroup apps/dex-monitor ./apps/dex-monitor

# Prune dev dependencies
RUN bun install --frozen-lockfile --production

# ============================
# Production stage
# ============================
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# Copy production dependencies
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/packages ./packages
COPY --from=builder --chown=appuser:appgroup /app/apps/dex-monitor ./apps/dex-monitor
COPY --from=builder --chown=appuser:appgroup /app/package.json ./

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --spider http://localhost:3000/healthz || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["bun", "run", "apps/dex-monitor/src/app/main.ts"]
