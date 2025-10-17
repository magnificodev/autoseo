#!/bin/bash

# Script to check and apply restart policy for Docker containers
# This ensures containers automatically restart after server reboot

echo "🔍 Checking current Docker containers restart policy..."

# Check current restart policy for all containers
echo "Current restart policies:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Command}}" | head -1
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Command}}" | grep -v NAMES

echo ""
echo "📋 Checking docker-compose.yml for restart policies..."

# Check if all services have restart policy
services=("postgres" "redis" "backend" "worker" "beat" "bot" "dashboard" "nginx")
missing_restart=()

for service in "${services[@]}"; do
    if ! grep -A 20 "^\s*${service}:" docker-compose.yml | grep -q "restart:"; then
        missing_restart+=("$service")
    fi
done

if [ ${#missing_restart[@]} -eq 0 ]; then
    echo "✅ All services have restart policy configured"
else
    echo "❌ Services missing restart policy: ${missing_restart[*]}"
    echo "Please add 'restart: unless-stopped' to these services in docker-compose.yml"
fi

echo ""
echo "🚀 Applying restart policy..."

# Stop all containers
echo "Stopping all containers..."
docker compose down

# Start with new restart policy
echo "Starting containers with restart policy..."
docker compose up -d

# Wait a moment for containers to start
sleep 5

echo ""
echo "📊 Container status after restart:"
docker compose ps

echo ""
echo "✅ Restart policy applied successfully!"
echo ""
echo "💡 To test auto-restart after reboot:"
echo "1. Run: sudo reboot"
echo "2. After server comes back up, run: docker compose ps"
echo "3. All containers should be running automatically"
echo ""
echo "🔧 Manual restart commands:"
echo "- Start all: docker compose up -d"
echo "- Stop all: docker compose down"
echo "- Restart specific service: docker compose restart <service_name>"
echo "- View logs: docker compose logs -f <service_name>"
