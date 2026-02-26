# ==========================================
# STAGE 1: Build the Vite Application
# ==========================================
FROM node:24-alpine AS builder

WORKDIR /app

# Install dependencies first (caches this step if package.json hasn't changed)
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the project for production. 
# Vite will bundle everything and put it in the /app/dist folder.
RUN npm run build

# ==========================================
# STAGE 2: Serve with Nginx
# ==========================================
FROM nginx:alpine

# Copy the compiled static files from the 'builder' stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 internally
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
