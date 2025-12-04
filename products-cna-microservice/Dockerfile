# ---------- Stage 1: Build Stage ----------
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy only package files first (for caching)
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm install

# Copy the rest of the source code
COPY . .

# ---------- Stage 2: Production Runtime ----------
FROM node:18-alpine

# Create and use a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

WORKDIR /app

# Copy only needed files from the builder stage
COPY --from=builder /app /app

# Install only production dependencies
RUN npm prune --production

# Expose API port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
