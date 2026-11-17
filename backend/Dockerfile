# =============================================================================
# BorrowBuy – Production Backend Container (Multi-Stage Build)
# =============================================================================

# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
COPY database/package*.json ./database/
COPY backend/package*.json ./backend/

RUN npm ci --workspace=backend

# Copy source code and Prisma schema
COPY database/prisma ./database/prisma
COPY backend/tsconfig.json ./backend/
COPY backend/src ./backend/src

# Generate Prisma Client
RUN npx prisma generate --schema=./database/prisma/schema.prisma

# Compile TypeScript
RUN npm run build --workspace=backend

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
COPY database/package*.json ./database/
COPY backend/package*.json ./backend/

RUN npm ci --workspace=backend --omit=dev && npm cache clean --force

# Copy compiled artifacts & generated Prisma client from builder
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY database/prisma ./database/prisma

# Non-root secure user
USER node

EXPOSE 5000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "backend/dist/server.js"]
