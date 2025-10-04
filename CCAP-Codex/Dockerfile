# Backend API
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
RUN npm install --production=false

FROM node:18-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY tsconfig.json ./tsconfig.json
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
ENV JWT_SECRET=change-me-in-production
ENV DB_PATH=/app/data/chess-club.db
COPY package.json package-lock.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
RUN mkdir -p /app/data
EXPOSE 4000
CMD ["node", "dist/server.js"]
