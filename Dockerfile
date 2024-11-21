# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for better caching
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies with clean install for production
RUN npm ci --legacy-peer-deps
RUN cd client && npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build client with production configuration
RUN cd client && npm run build

# Build server
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files for production
COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

# Install only production dependencies
RUN npm ci --only=production --legacy-peer-deps

# Copy and rename environment file
COPY .env.example .env

# Expose port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    WS_PORT=3000 \
    WS_HOST=tic-tac-toe-ij1b.onrender.com \
    WS_PATH=/socket.io \
    CORS_ORIGIN=https://tic-tac-toe-ij1b.onrender.com \
    MAX_PLAYERS_PER_GAME=2 \
    GAME_TIMEOUT_SECONDS=300 \
    LOG_LEVEL=info

# Start the application
CMD ["npm", "run", "start:prod"]
