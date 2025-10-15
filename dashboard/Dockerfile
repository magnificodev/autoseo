FROM node:20-alpine AS deps
WORKDIR /app
COPY dashboard/package.json dashboard/package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY dashboard .
RUN npm run build || echo "skip build in phase 0"

FROM node:20-alpine AS runner
WORKDIR /app
# Use development mode for Next.js dev server to avoid prerender-manifest issues
ENV NODE_ENV=development
COPY --from=builder /app .
EXPOSE 3000
CMD ["npm", "run", "dev"]


