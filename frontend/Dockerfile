# =============================================================================
# BorrowBuy – Production Frontend Static Bundle Container
# =============================================================================

# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY frontend/package*.json ./frontend/

RUN npm ci --workspace=frontend

COPY frontend ./frontend

RUN npm run build --workspace=frontend

# Serving stage with Nginx
FROM nginx:alpine

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
