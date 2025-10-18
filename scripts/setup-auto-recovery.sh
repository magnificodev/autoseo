#!/bin/bash

# Setup Auto-Recovery System for AutoSEO
# This script sets up automatic monitoring and recovery

set -e

PROJECT_DIR="/home/mauticuser/autoseo"
SCRIPTS_DIR="$PROJECT_DIR/scripts"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Make scripts executable
log_message "Making scripts executable..."
chmod +x "$SCRIPTS_DIR/nginx-health-monitor.sh"
chmod +x "$SCRIPTS_DIR/autoseo-auto-recovery.sh"
chmod +x "$SCRIPTS_DIR/setup-auto-recovery.sh"

# Create log directories
log_message "Creating log directories..."
sudo mkdir -p /var/log
sudo touch /var/log/nginx-health-monitor.log
sudo touch /var/log/autoseo-recovery.log
sudo chown mauticuser:mauticuser /var/log/nginx-health-monitor.log
sudo chown mauticuser:mauticuser /var/log/autoseo-recovery.log

# Install systemd service
log_message "Installing systemd service..."
sudo cp "$SCRIPTS_DIR/autoseo-monitor.service" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable autoseo-monitor.service

# Create cron job for additional monitoring
log_message "Setting up cron job..."
(crontab -l 2>/dev/null; echo "*/5 * * * * $SCRIPTS_DIR/nginx-health-monitor.sh >/dev/null 2>&1") | crontab -

# Create startup script
log_message "Creating startup script..."
cat > "$SCRIPTS_DIR/start-autoseo.sh" << 'EOF'
#!/bin/bash
cd /home/mauticuser/autoseo
docker compose up -d
sleep 30
sudo systemctl start autoseo-monitor.service
echo "AutoSEO started with auto-recovery enabled"
EOF

chmod +x "$SCRIPTS_DIR/start-autoseo.sh"

# Create stop script
log_message "Creating stop script..."
cat > "$SCRIPTS_DIR/stop-autoseo.sh" << 'EOF'
#!/bin/bash
sudo systemctl stop autoseo-monitor.service
cd /home/mauticuser/autoseo
docker compose down
echo "AutoSEO stopped"
EOF

chmod +x "$SCRIPTS_DIR/stop-autoseo.sh"

# Create status script
log_message "Creating status script..."
cat > "$SCRIPTS_DIR/status-autoseo.sh" << 'EOF'
#!/bin/bash
echo "=== AutoSEO Status ==="
echo "Docker Services:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Monitor Service:"
sudo systemctl status autoseo-monitor.service --no-pager
echo ""
echo "Recent Logs:"
tail -10 /var/log/autoseo-recovery.log 2>/dev/null || echo "No logs yet"
EOF

chmod +x "$SCRIPTS_DIR/status-autoseo.sh"

log_message "Auto-recovery system setup complete!"
log_message "Use these commands:"
log_message "  Start: $SCRIPTS_DIR/start-autoseo.sh"
log_message "  Stop:  $SCRIPTS_DIR/stop-autoseo.sh"
log_message "  Status: $SCRIPTS_DIR/status-autoseo.sh"
log_message "  Monitor logs: tail -f /var/log/autoseo-recovery.log"
