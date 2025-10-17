# Autoseo Scripts

This directory contains utility scripts for managing the Autoseo application.

## 📋 Available Scripts

### 1. `check-restart-policy.sh`
**Purpose**: Check and apply restart policy for Docker containers

**Usage**:
```bash
./scripts/check-restart-policy.sh
```

**What it does**:
- Verifies all services in `docker-compose.yml` have `restart: unless-stopped`
- Stops and restarts containers with the new restart policy
- Shows container status after restart

### 2. `health-check.sh`
**Purpose**: Comprehensive health check for all Autoseo services

**Usage**:
```bash
./scripts/health-check.sh
```

**What it checks**:
- Container status
- Backend API health
- Dashboard accessibility
- Nginx proxy
- PostgreSQL database
- Redis cache
- Celery worker and beat
- Telegram bot
- System resources (disk, memory)
- Docker restart policies

### 3. `setup-auto-start.sh`
**Purpose**: Setup automatic startup of containers on server boot

**Usage**:
```bash
sudo ./scripts/setup-auto-start.sh
```

**What it does**:
- Creates a systemd service (`autoseo.service`)
- Enables the service to start on boot
- Configures proper startup order for all containers
- Sets correct user permissions

## 🔧 Troubleshooting

### Containers not starting after reboot

1. **Check if systemd service is enabled**:
   ```bash
   sudo systemctl status autoseo
   ```

2. **Check Docker service**:
   ```bash
   sudo systemctl status docker
   ```

3. **Manual start**:
   ```bash
   cd ~/autoseo
   docker compose up -d
   ```

4. **Check logs**:
   ```bash
   docker compose logs
   ```

### Restart policy not working

1. **Verify restart policy in docker-compose.yml**:
   ```bash
   grep -A 5 "restart:" docker-compose.yml
   ```

2. **Reapply restart policy**:
   ```bash
   ./scripts/check-restart-policy.sh
   ```

3. **Check container restart policy**:
   ```bash
   docker inspect <container_name> | grep -A 5 "RestartPolicy"
   ```

### Service health issues

1. **Run comprehensive health check**:
   ```bash
   ./scripts/health-check.sh
   ```

2. **Check specific service logs**:
   ```bash
   docker compose logs -f <service_name>
   ```

3. **Restart problematic service**:
   ```bash
   docker compose restart <service_name>
   ```

## 🚀 Quick Setup Guide

### First-time setup:
```bash
# 1. Deploy the application
cd ~/autoseo

# 2. Apply restart policy
./scripts/check-restart-policy.sh

# 3. Setup auto-start (requires sudo)
sudo ./scripts/setup-auto-start.sh

# 4. Verify everything is working
./scripts/health-check.sh
```

### After server reboot:
```bash
# Just run health check to verify
./scripts/health-check.sh
```

## 📊 Service Dependencies

The containers start in this order due to `depends_on` configuration:

1. **Infrastructure**: `postgres`, `redis`
2. **Backend**: `backend` (depends on postgres, redis)
3. **Workers**: `worker`, `beat` (depend on backend, redis)
4. **Bot**: `bot` (depends on backend)
5. **Frontend**: `dashboard` (depends on backend)
6. **Proxy**: `nginx` (depends on backend, dashboard)

## 🔍 Monitoring Commands

```bash
# View all container status
docker compose ps

# View logs for all services
docker compose logs -f

# View logs for specific service
docker compose logs -f backend

# Check system resources
docker system df
df -h
free -h

# Check restart policies
docker inspect $(docker compose ps -q) | grep -A 3 "RestartPolicy"
```

## ⚠️ Important Notes

- **Restart Policy**: `unless-stopped` means containers will restart automatically unless manually stopped
- **Systemd Service**: Provides additional layer of auto-start on boot
- **Health Checks**: Built-in health checks ensure services are actually ready before marking as healthy
- **Dependencies**: Services wait for their dependencies to be healthy before starting
- **User Permissions**: The systemd service runs as the user who owns the project directory

## 🆘 Emergency Recovery

If everything fails:

```bash
# Stop everything
docker compose down

# Remove all containers and volumes (WARNING: data loss)
docker compose down -v
docker system prune -af

# Rebuild and start fresh
docker compose up -d --build

# Reapply restart policy
./scripts/check-restart-policy.sh

# Setup auto-start again
sudo ./scripts/setup-auto-start.sh
```
