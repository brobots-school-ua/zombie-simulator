# Build frontend
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build

# Production — run Express server (serves API + static files)
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY prisma ./prisma
RUN npx prisma generate
COPY --from=build /app/dist ./dist
COPY server ./server
EXPOSE 80
ENV NODE_ENV=production
ENV PORT=80
CMD ["npx", "tsx", "server/index.ts"]
