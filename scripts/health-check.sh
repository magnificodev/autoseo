#!/bin/bash

# Health check script for Autoseo services
# Run this after server reboot to verify all services are running

echo "🏥 Autoseo Health Check"
echo "======================"
echo ""

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Starting Docker service..."
    sudo systemctl start docker
    sleep 5
fi

echo "📊 Container Status:"
echo "-------------------"
docker compose ps

echo ""
echo "🔍 Service Health Checks:"
echo "------------------------"

# Check backend health
echo -n "Backend API: "
if curl -sf http://localhost:8000/health >/dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Check dashboard
echo -n "Dashboard: "
if curl -sf http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Check nginx
echo -n "Nginx: "
if curl -sf http://localhost/health >/dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Check database
echo -n "PostgreSQL: "
if docker compose exec -T postgres pg_isready -U autoseo >/dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Check Redis
echo -n "Redis: "
if docker compose exec -T redis redis-cli ping >/dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Check Celery worker
echo -n "Celery Worker: "
if docker compose exec -T worker celery -A src.scheduler.celery_app.app inspect ping >/dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Check Celery beat
echo -n "Celery Beat: "
if docker compose ps beat | grep -q "Up"; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Check Telegram bot
echo -n "Telegram Bot: "
if docker compose ps bot | grep -q "Up"; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

echo ""
echo "📈 System Resources:"
echo "-------------------"
echo "Disk usage:"
df -h / | tail -1

echo ""
echo "Memory usage:"
free -h

echo ""
echo "Docker system info:"
docker system df

echo ""
echo "🔄 Restart Policy Status:"
echo "------------------------"
for container in $(docker compose ps -q); do
    name=$(docker inspect --format='{{.Name}}' $container | sed 's/\///')
    restart_policy=$(docker inspect --format='{{.HostConfig.RestartPolicy.Name}}' $container)
    echo "$name: $restart_policy"
done

echo ""
echo "💡 Troubleshooting Commands:"
echo "----------------------------"
echo "View logs: docker compose logs -f <service_name>"
echo "Restart service: docker compose restart <service_name>"
echo "Restart all: docker compose restart"
echo "Full restart: docker compose down && docker compose up -d"
echo ""
echo "🔧 If services are not running:"
echo "1. Check logs: docker compose logs"
echo "2. Restart: docker compose restart"
echo "3. Full rebuild: docker compose down && docker compose up -d --build"
