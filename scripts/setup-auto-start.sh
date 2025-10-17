#!/bin/bash

# Setup script to enable automatic startup of Autoseo containers
# This creates a systemd service to start containers on boot

echo "🚀 Setting up Autoseo auto-start on boot"
echo "======================================="
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo "❌ This script needs to be run with sudo privileges"
    echo "Usage: sudo ./scripts/setup-auto-start.sh"
    exit 1
fi

# Get current user and home directory
CURRENT_USER=${SUDO_USER:-$USER}
USER_HOME=$(eval echo ~$CURRENT_USER)
AUTOSEO_DIR="$USER_HOME/autoseo"

echo "📁 Autoseo directory: $AUTOSEO_DIR"

# Check if autoseo directory exists
if [ ! -d "$AUTOSEO_DIR" ]; then
    echo "❌ Autoseo directory not found at $AUTOSEO_DIR"
    echo "Please ensure the project is deployed to the correct location"
    exit 1
fi

# Create systemd service file
echo "📝 Creating systemd service file..."
cat > /etc/systemd/system/autoseo.service << EOF
[Unit]
Description=Autoseo Docker Compose Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$AUTOSEO_DIR
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0
User=$CURRENT_USER
Group=$CURRENT_USER

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
echo "🔄 Reloading systemd daemon..."
systemctl daemon-reload

# Enable the service
echo "✅ Enabling autoseo service..."
systemctl enable autoseo.service

# Start the service
echo "🚀 Starting autoseo service..."
systemctl start autoseo.service

# Check status
echo ""
echo "📊 Service Status:"
echo "-----------------"
systemctl status autoseo.service --no-pager

echo ""
echo "✅ Auto-start setup completed!"
echo ""
echo "💡 Commands to manage the service:"
echo "  - Check status: sudo systemctl status autoseo"
echo "  - Start: sudo systemctl start autoseo"
echo "  - Stop: sudo systemctl stop autoseo"
echo "  - Restart: sudo systemctl restart autoseo"
echo "  - Disable: sudo systemctl disable autoseo"
echo ""
echo "🔍 To verify auto-start works:"
echo "  1. Reboot the server: sudo reboot"
echo "  2. After reboot, run: ./scripts/health-check.sh"
echo "  3. All containers should be running automatically"
echo ""
echo "📋 Service will start containers in this order:"
echo "  1. postgres, redis (infrastructure)"
echo "  2. backend (depends on postgres, redis)"
echo "  3. worker, beat (depends on backend, redis)"
echo "  4. bot (depends on backend)"
echo "  5. dashboard (depends on backend)"
echo "  6. nginx (depends on backend, dashboard)"
