# ---- build ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ---- produção ----
FROM node:20-alpine AS runner

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY index.html ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/server.js"]