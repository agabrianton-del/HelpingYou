# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/shared/package*.json ./packages/shared/

RUN npm ci

COPY tsconfig.json ./
COPY packages/shared/ ./packages/shared/
COPY packages/backend/ ./packages/backend/

WORKDIR /app/packages/backend
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install production dependencies only to keep the image lean
COPY --chown=nodejs:nodejs package*.json ./
COPY --chown=nodejs:nodejs packages/backend/package*.json ./packages/backend/
COPY --chown=nodejs:nodejs packages/shared/package*.json ./packages/shared/
RUN npm ci --omit=dev

COPY --from=builder --chown=nodejs:nodejs /app/packages/shared ./packages/shared
COPY --from=builder --chown=nodejs:nodejs /app/packages/backend/dist ./packages/backend/dist

USER nodejs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "packages/backend/dist/server.js"]
