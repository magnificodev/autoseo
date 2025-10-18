#!/bin/bash

# AutoSEO Auto-Recovery Script
# Automatically detects and fixes common issues

LOG_FILE="/var/log/autoseo-recovery.log"
PROJECT_DIR="/home/mauticuser/autoseo"
MAX_RETRIES=3
CHECK_INTERVAL=60

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

check_service_health() {
    local service=$1
    local url=$2
    
    if curl -sf "$url" >/dev/null 2>&1; then
        return 0
    else
        log_message "WARNING: $service health check failed at $url"
        return 1
    fi
}

check_docker_connectivity() {
    local container=$1
    local target=$2
    local port=$3
    
    if docker exec "$container" wget -qO- "http://$target:$port" >/dev/null 2>&1; then
        return 0
    else
        log_message "WARNING: $container cannot reach $target:$port"
        return 1
    fi
}

restart_service() {
    local service=$1
    log_message "INFO: Restarting $service"
    
    cd "$PROJECT_DIR" || exit 1
    
    case $service in
        "nginx")
            docker compose restart nginx
            sleep 15
            ;;
        "backend")
            docker compose restart backend
            sleep 20
            ;;
        "dashboard")
            docker compose restart dashboard
            sleep 15
            ;;
        "all")
            log_message "INFO: Restarting all services"
            docker compose down
            sleep 5
            docker compose up -d
            sleep 30
            ;;
    esac
}

fix_502_errors() {
    log_message "INFO: Detected 502 errors, attempting fix"
    
    # Check if containers are running
    if ! docker ps | grep -q "autoseo-nginx-1.*Up"; then
        log_message "ERROR: Nginx container not running"
        restart_service "nginx"
        return
    fi
    
    if ! docker ps | grep -q "autoseo-backend-1.*Up"; then
        log_message "ERROR: Backend container not running"
        restart_service "backend"
        return
    fi
    
    if ! docker ps | grep -q "autoseo-dashboard-1.*Up"; then
        log_message "ERROR: Dashboard container not running"
        restart_service "dashboard"
        return
    fi
    
    # Check connectivity
    if ! check_docker_connectivity "autoseo-nginx-1" "backend" "8000"; then
        log_message "ERROR: Nginx cannot reach backend"
        restart_service "nginx"
        return
    fi
    
    if ! check_docker_connectivity "autoseo-nginx-1" "dashboard" "3000"; then
        log_message "ERROR: Nginx cannot reach dashboard"
        restart_service "nginx"
        return
    fi
    
    # If all containers are running but still 502, restart nginx
    log_message "INFO: All containers running but 502 persists, restarting nginx"
    restart_service "nginx"
}

check_and_fix_issues() {
    local issues_found=0
    
    # Check main health endpoint
    if ! check_service_health "Main" "http://localhost/health"; then
        issues_found=1
    fi
    
    # Check if we can access dashboard
    if ! check_service_health "Dashboard" "http://localhost/"; then
        issues_found=1
    fi
    
    # Check backend directly
    if ! check_service_health "Backend" "http://localhost:8000/health"; then
        issues_found=1
    fi
    
    # Check dashboard directly
    if ! check_service_health "Dashboard Direct" "http://localhost:3000/"; then
        issues_found=1
    fi
    
    if [ $issues_found -eq 1 ]; then
        fix_502_errors
    else
        log_message "INFO: All services healthy"
    fi
}

# Main monitoring loop
log_message "INFO: Starting AutoSEO Auto-Recovery Monitor"

while true; do
    check_and_fix_issues
    sleep $CHECK_INTERVAL
done
