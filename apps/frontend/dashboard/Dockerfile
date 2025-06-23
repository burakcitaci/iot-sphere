# Build stage
FROM docker.io/node:lts-alpine AS builder

# Enable better compatibility and add build tools
RUN apk add --no-cache libc6-compat git python3 make g++

WORKDIR /app

# Configure yarn for better performance and reliability
RUN yarn config set network-timeout 300000 && \
    yarn config set cache-folder /usr/local/share/.cache/yarn && \
    yarn config set prefer-offline true

# Copy package files for dependency installation
COPY package.json yarn.lock ./
COPY apps/frontend/dashboard/package.json ./apps/frontend/dashboard/
COPY apps/shared/package.json ./apps/shared/

# Install dependencies with optimizations
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --frozen-lockfile --prefer-offline --silent

# Copy configuration files
COPY nx.json tsconfig.base.json tsconfig.json ./
COPY .eslintrc.json ./

# Copy source code including shared library
COPY apps/frontend/dashboard ./apps/frontend/dashboard
COPY apps/shared ./apps/shared

# Build with optimizations
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Sync TypeScript configuration before building
RUN yarn nx sync

# Build the dashboard
RUN yarn nx build dashboard --skip-nx-cache --configuration=production

# Production stage
FROM nginx:alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user first
RUN addgroup -g 1001 -S nodejs && \
    adduser -S dashboard -u 1001

# Copy built application
COPY --from=builder /app/apps/frontend/dashboard/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/frontend/dashboard/nginx.conf /etc/nginx/nginx.conf

# Create necessary directories and set permissions for nginx to run as non-root
RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    mkdir -p /var/cache/nginx/scgi_temp && \
    mkdir -p /var/log/nginx && \
    chown -R dashboard:nodejs /var/cache/nginx && \
    chown -R dashboard:nodejs /var/log/nginx && \
    chown -R dashboard:nodejs /usr/share/nginx/html && \
    chown -R dashboard:nodejs /etc/nginx/conf.d && \
    chown -R dashboard:nodejs /tmp

# Switch to non-root user
USER dashboard

EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]