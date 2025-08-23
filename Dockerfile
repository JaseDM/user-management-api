# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=20

# Etapa 1: build (con devDependencies)
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# Etapa 2: deps de producción (sin devDependencies)
FROM node:${NODE_VERSION}-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# Etapa 3: runtime mínimo y seguro
FROM node:${NODE_VERSION}-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Usuario no root
RUN addgroup -g 1001 nodejs && adduser -u 1001 -G nodejs -D nodejs

# Copiamos SOLO lo necesario
COPY --chown=nodejs:nodejs --from=prod-deps /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs --from=builder /app/dist ./dist
COPY --chown=nodejs:nodejs package*.json ./

USER nodejs
EXPOSE 3000

# Healthcheck (ajusta la ruta si tu endpoint es otro)
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/health',r=>process.exit(r.statusCode<400?0:1)).on('error',()=>process.exit(1))"

# Arranque directo en prod
CMD ["node", "dist/main.js"]