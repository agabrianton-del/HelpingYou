# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/web/package*.json ./packages/web/
COPY packages/shared/package*.json ./packages/shared/

RUN npm ci

COPY tsconfig.json ./
COPY packages/shared/ ./packages/shared/
COPY packages/web/ ./packages/web/

WORKDIR /app/packages/web
RUN npm run build

# ---- Serve stage ----
FROM nginx:1.25-alpine

COPY --from=builder /app/packages/web/dist /usr/share/nginx/html

# SPA routing: serve index.html for all routes not matching a file
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' \
    > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
