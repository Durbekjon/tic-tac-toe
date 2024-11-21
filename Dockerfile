FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json client/
COPY shared/ shared/

# Install dependencies
RUN npm install --legacy-peer-deps
RUN cd client && npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build client
RUN cd client && npm run build --force

# Build server
RUN npm run build --force

FROM node:18-alpine

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist/client ./client/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "run", "start:prod"]
