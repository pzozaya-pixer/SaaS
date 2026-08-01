# ===================================================
# Stage 1: Base - Instala dependencias y prepara el entorno
# ===================================================
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/worker/package.json ./apps/worker/
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/
RUN npm ci

# ===================================================
# Stage 2: Builder - Copia código y compila el monorepo
# ===================================================
FROM base AS builder
WORKDIR /app
COPY . .
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma
RUN npm run build

# ===================================================
# Stage 3: Runner - API NestJS
# ===================================================
FROM node:20-alpine AS api
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]

# ===================================================
# Stage 4: Runner - Worker NestJS
# ===================================================
FROM node:20-alpine AS worker
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/apps/worker/package.json ./apps/worker/package.json

CMD ["node", "apps/worker/dist/main.js"]

# ===================================================
# Stage 5: Runner - Web Next.js
# ===================================================
FROM node:20-alpine AS web
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json

EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=apps/web"]
