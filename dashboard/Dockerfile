FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN ls -la
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN echo "=== DEBUG: Check if components exist before build ==="
RUN ls -la components/ || echo "components/ not found"
RUN ls -la components/ui/ || echo "components/ui/ not found"
RUN echo "=== DEBUG: Check tsconfig.json ==="
RUN cat tsconfig.json | grep -A 5 "paths"
RUN echo "=== DEBUG: Check next.config.js ==="
RUN cat next.config.js
RUN echo "=== DEBUG: Test alias resolution manually ==="
RUN node -e "console.log(require('path').resolve('.'))"
RUN echo "=== DEBUG: Check if badge.tsx exists ==="
RUN find . -name "badge.tsx" -type f
RUN echo "=== DEBUG: Check current directory structure ==="
RUN pwd
RUN ls -la
RUN echo "=== DEBUG: Check if components directory exists ==="
RUN test -d components && echo "components directory exists" || echo "components directory NOT FOUND"
RUN echo "=== DEBUG: Check if components/ui directory exists ==="
RUN test -d components/ui && echo "components/ui directory exists" || echo "components/ui directory NOT FOUND"
RUN echo "=== DEBUG: List all files in components/ui ==="
RUN ls -la components/ui/ 2>/dev/null || echo "Cannot list components/ui/"
RUN echo "=== DEBUG: Try to create components directory if missing ==="
RUN mkdir -p components/ui || echo "Cannot create components/ui"
RUN echo "=== DEBUG: Check if we can access components/ui after mkdir ==="
RUN ls -la components/ui/ 2>/dev/null || echo "Still cannot list components/ui/"
RUN echo "=== DEBUG: Check if we can find any .tsx files ==="
RUN find . -name "*.tsx" -type f | head -10
RUN echo "=== DEBUG: Check specific UI component files ==="
RUN echo "All files in components/ui/:"
RUN ls -la components/ui/ || echo "components/ui/ not found"
RUN echo "Looking for lowercase files:"
RUN find components/ui/ -name "*.tsx" -type f || echo "No .tsx files found in components/ui/"
RUN echo "=== DEBUG: Remove any UPPERCASE files to prevent case conflicts ==="
RUN find components/ui/ -name "[A-Z]*.tsx" -type f -delete || echo "No UPPERCASE files to delete"
RUN echo "=== DEBUG: Verify only lowercase files remain ==="
RUN find components/ui/ -name "*.tsx" -type f
RUN echo "=== DEBUG: Test module resolution ==="
RUN node -e "try { console.log('badge:', require.resolve('./components/ui/badge')); } catch(e) { console.log('badge not found:', e.message); }"
RUN echo "=== DEBUG: Force clear any cache and build ==="
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