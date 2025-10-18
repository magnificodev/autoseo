FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN ls -la
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN echo "=== DEBUG: Current directory structure ==="
RUN pwd
RUN ls -la
RUN echo "=== DEBUG: Looking for components directory ==="
RUN find . -name "components" -type d
RUN echo "=== DEBUG: Looking for UI components ==="
RUN find . -name "badge.tsx" -type f
RUN find . -name "button.tsx" -type f
RUN find . -name "input.tsx" -type f
RUN echo "=== DEBUG: Components directory contents ==="
RUN ls -la components/ 2>/dev/null || echo "components/ directory not found"
RUN ls -la components/ui/ 2>/dev/null || echo "components/ui/ directory not found"
RUN echo "=== DEBUG: App directory structure ==="
RUN ls -la app/
RUN ls -la app/audit-logs/
RUN echo "=== DEBUG: Starting build ==="
RUN echo "=== DEBUG: Check if components exist before build ==="
RUN ls -la components/ || echo "components/ not found"
RUN ls -la components/ui/ || echo "components/ui/ not found"
RUN echo "=== DEBUG: Check tsconfig.json ==="
RUN cat tsconfig.json | grep -A 5 "paths"
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache libc6-compat
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
# Public directory not needed for standalone Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
CMD ["node", "server.js"]


