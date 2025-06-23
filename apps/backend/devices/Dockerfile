# Multi-stage build for the devices backend
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY apps/backend/devices/package.json ./apps/backend/devices/
COPY libs/ ./libs/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY apps/backend/devices/ ./apps/backend/devices/
COPY nx.json tsconfig.base.json ./

# Build the application
RUN yarn nx build devices --prod

# Production stage
FROM node:18-alpine AS production

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/devices/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/devices/package.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3004

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3004/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/main.js"] 