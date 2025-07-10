# ----------------------------
# Stage 1: Build React frontend
# ----------------------------
FROM node:18 AS builder

WORKDIR /app

# Copy only necessary files for faster rebuilds
COPY package*.json ./
COPY vite.config.* ./
COPY public ./public
COPY src ./src

RUN npm install
RUN npm run build

# ----------------------------
# Stage 2: Run Express server
# ----------------------------
FROM node:18 AS server

WORKDIR /app

# Copy Express server
COPY server ./server
COPY server/package.json ./server/package.json

# Install server dependencies
RUN cd server && npm install

# Copy built frontend from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Run Express server
CMD ["node", "server/index.js"]
