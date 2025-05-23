# Stage 1: Build
FROM node:23-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run
FROM node:23-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/uploads ./uploads
COPY package*.json ./
RUN npm install --omit=dev
EXPOSE 8080
CMD ["node", "dist/server.js"]
