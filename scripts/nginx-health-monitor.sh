#!/bin/bash

# Nginx Health Monitor Script
# Monitors nginx health and restarts if needed

LOG_FILE="/var/log/nginx-health-monitor.log"
NGINX_CONTAINER="autoseo-nginx-1"
MAX_FAILURES=3
CHECK_INTERVAL=30

failure_count=0

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

check_nginx_health() {
    # Check if nginx container is running
    if ! docker ps | grep -q "$NGINX_CONTAINER.*Up"; then
        log_message "ERROR: Nginx container is not running"
        return 1
    fi
    
    # Check if nginx is responding
    if ! curl -sf http://localhost/health >/dev/null 2>&1; then
        log_message "ERROR: Nginx health check failed"
        return 1
    fi
    
    # Check if nginx can reach backend
    if ! docker exec "$NGINX_CONTAINER" wget -qO- http://backend:8000/health >/dev/null 2>&1; then
        log_message "ERROR: Nginx cannot reach backend"
        return 1
    fi
    
    # Check if nginx can reach dashboard
    if ! docker exec "$NGINX_CONTAINER" wget -qO- http://dashboard:3000 >/dev/null 2>&1; then
        log_message "ERROR: Nginx cannot reach dashboard"
        return 1
    fi
    
    return 0
}

restart_nginx() {
    log_message "INFO: Restarting nginx container"
    docker restart "$NGINX_CONTAINER"
    sleep 10
    
    if check_nginx_health; then
        log_message "INFO: Nginx restart successful"
        failure_count=0
    else
        log_message "ERROR: Nginx restart failed"
        failure_count=$((failure_count + 1))
    fi
}

log_message "INFO: Starting nginx health monitor"

while true; do
    if check_nginx_health; then
        if [ $failure_count -gt 0 ]; then
            log_message "INFO: Nginx health restored"
            failure_count=0
        fi
    else
        failure_count=$((failure_count + 1))
        log_message "WARNING: Nginx health check failed ($failure_count/$MAX_FAILURES)"
        
        if [ $failure_count -ge $MAX_FAILURES ]; then
            log_message "ERROR: Max failures reached, restarting nginx"
            restart_nginx
        fi
    fi
    
    sleep $CHECK_INTERVAL
done
