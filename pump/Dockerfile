# ===============================
# Build Stage
# ===============================

FROM node:22-bookworm AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build


# ===============================
# Runtime Stage
# ===============================

FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

COPY certs ./certs

EXPOSE 4842

CMD ["node", "dist/server.js"]