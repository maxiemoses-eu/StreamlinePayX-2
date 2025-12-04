# ----------------------------------------------------
# Stage 1: Build Stage (The Builder)
# Using 'alpine' for a minimal build environment.
# ----------------------------------------------------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies (using 'npm ci' for speed and exact lockfile matching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# ----------------------------------------------------
# Stage 2: Serve Stage (The Final, Minimal Image)
# We switch to Nginx, a tiny web server, to serve the static files.
# ----------------------------------------------------
FROM nginx:alpine

# Clean up default Nginx content for clarity
RUN rm -rf /usr/share/nginx/html/*

# Copy built React app from builder stage (assuming 'build' folder)
COPY --from=builder /app/build /usr/share/nginx/html

# NOTE: If your app uses client-side routing (like React Router), you MUST 
# uncomment the line below and provide a custom Nginx config (nginx.conf) 
# to ensure all routes resolve correctly.
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
