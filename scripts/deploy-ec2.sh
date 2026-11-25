#!/usr/bin/env bash
# ==============================================================================
# BorrowBuy Equipment Rental Platform - EC2 Deployment Script
# ==============================================================================
# Executed on EC2 host i-03347c2b6584c73cb via AWS Systems Manager (SSM)
# Preserves PostgreSQL on EBS, rebuilds backend & frontend, updates Nginx,
# verifies health, and performs automatic rollback on failure.
# Hardened for non-interactive SSM execution and safe Git repository ownership.
# ==============================================================================

set -eo pipefail

APP_DIR="/home/ec2-user/app"
DEPLOY_LOG="/var/log/borrowbuy-deploy.log"
PREV_COMMIT_FILE="${APP_DIR}/.prev_commit"
TARGET_COMMIT="${1:-HEAD}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
BACKUP_BASE_DIR="/home/ec2-user/backups"

log() {
  echo "[${TIMESTAMP}] [DEPLOY] $1" | tee -a "${DEPLOY_LOG}"
}

error() {
  echo "[${TIMESTAMP}] [ERROR] $1" | tee -a "${DEPLOY_LOG}" >&2
}

log "=========================================================="
log "Starting BorrowBuy Deployment: Target Commit ${TARGET_COMMIT}"
log "=========================================================="

# Ensure proper environment variables for non-interactive SSM execution
export HOME="/home/ec2-user"
export USER="ec2-user"
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

# Ensure log file exists and is writable
touch "${DEPLOY_LOG}" 2>/dev/null || true
chmod 666 "${DEPLOY_LOG}" 2>/dev/null || true

# Ensure backups base directory exists
mkdir -p "${BACKUP_BASE_DIR}"
chown ec2-user:ec2-user "${BACKUP_BASE_DIR}"

cd "${APP_DIR}"

# 1. Configure Git safe.directory strictly for APP_DIR
# Configures system-level git config so any user (root or ec2-user) trusts APP_DIR
if ! git config --system --get-all safe.directory 2>/dev/null | grep -Fxq "${APP_DIR}"; then
  log "Configuring system safe.directory for ${APP_DIR}..."
  git config --system --add safe.directory "${APP_DIR}" || true
fi
git config --global --add safe.directory "${APP_DIR}" 2>/dev/null || true
sudo -u ec2-user -H git config --global --add safe.directory "${APP_DIR}" 2>/dev/null || true

# 2. Validate Target Commit Input (Prevent Shell Injection & Invalid SHAs)
if [ -n "${TARGET_COMMIT}" ] && [ "${TARGET_COMMIT}" != "HEAD" ]; then
  if [[ ! "${TARGET_COMMIT}" =~ ^[0-9a-fA-F]{7,40}$ ]]; then
    error "Invalid TARGET_COMMIT '${TARGET_COMMIT}'. Must be 'HEAD' or a 7-40 character hexadecimal Git commit SHA."
    exit 1
  fi
fi

# 3. Ensure repository ownership is consistent before Git operations
chown -R ec2-user:ec2-user "${APP_DIR}"

# 4. Record pre-deployment commit SHA for rollback
PREV_COMMIT=$(sudo -u ec2-user -H git -C "${APP_DIR}" rev-parse HEAD 2>/dev/null || echo "")
if [ -n "${PREV_COMMIT}" ]; then
  echo "${PREV_COMMIT}" > "${PREV_COMMIT_FILE}"
  chown ec2-user:ec2-user "${PREV_COMMIT_FILE}" 2>/dev/null || true
  log "Current commit recorded for rollback: ${PREV_COMMIT}"
fi

# 5. Fetch latest commits as ec2-user (avoids root-owned .git/FETCH_HEAD)
log "Fetching latest commits from origin..."
sudo -u ec2-user -H git -C "${APP_DIR}" fetch origin main

# Clean any uncommitted working changes on tracked files
sudo -u ec2-user -H git -C "${APP_DIR}" reset --hard HEAD || true

# Resolve target checkout reference
if [ "${TARGET_COMMIT}" != "HEAD" ]; then
  TARGET_REF="${TARGET_COMMIT}"
else
  TARGET_REF="origin/main"
fi

log "Target checkout reference: ${TARGET_REF}"

# 6. Safe Checkout with automatic untracked file collision backup
# If local untracked files conflict with files in the target commit tree,
# back them up to a timestamped backup directory instead of failing checkout.
if ! sudo -u ec2-user -H git -C "${APP_DIR}" checkout "${TARGET_REF}" 2>&1; then
  log "Checkout encountered a conflict. Checking for conflicting untracked files..."
  CONFLICT_BACKUP_DIR="${BACKUP_BASE_DIR}/deploy-conflicts-$(date -u +%Y%m%d%H%M%S)"
  mkdir -p "${CONFLICT_BACKUP_DIR}"
  chown -R ec2-user:ec2-user "${CONFLICT_BACKUP_DIR}"

  # Find untracked files and back up any that exist in the target commit tree
  UNTRACKED_FILES=$(sudo -u ec2-user -H git -C "${APP_DIR}" ls-files --others --exclude-standard)
  for f in ${UNTRACKED_FILES}; do
    if sudo -u ec2-user -H git -C "${APP_DIR}" ls-tree -r --name-only "${TARGET_REF}" 2>/dev/null | grep -Fxq "$f"; then
      log "Backing up conflicting untracked file '$f' to ${CONFLICT_BACKUP_DIR}/$f"
      mkdir -p "${CONFLICT_BACKUP_DIR}/$(dirname "$f")"
      mv "${APP_DIR}/$f" "${CONFLICT_BACKUP_DIR}/$f"
    fi
  done

  # Retry checkout after resolving collisions
  log "Retrying checkout after backing up conflicting files..."
  sudo -u ec2-user -H git -C "${APP_DIR}" checkout "${TARGET_REF}"
fi

DEPLOYED_SHA=$(sudo -u ec2-user -H git -C "${APP_DIR}" rev-parse HEAD)
log "Checked out commit SHA: ${DEPLOYED_SHA}"

# Verify deployed commit matches target commit
if [ "${TARGET_COMMIT}" != "HEAD" ]; then
  if [[ "${DEPLOYED_SHA}" != "${TARGET_COMMIT}"* ]]; then
    error "Commit SHA mismatch! Checked out '${DEPLOYED_SHA}' does not match target '${TARGET_COMMIT}'."
    exit 1
  fi
fi

# 7. Safe Rollback Function
rollback() {
  error "Deployment verification failed! Initiating automatic rollback..."
  if [ -n "${PREV_COMMIT}" ] && [ "${PREV_COMMIT}" != "${DEPLOYED_SHA}" ]; then
    log "Rolling back to previous working commit: ${PREV_COMMIT}..."
    sudo -u ec2-user -H git -C "${APP_DIR}" checkout "${PREV_COMMIT}"
    sudo -u ec2-user -H bash -c "cd ${APP_DIR} && npx prisma generate --schema=./database/prisma/schema.prisma"
    sudo -u ec2-user -H bash -c "cd ${APP_DIR} && npm run build --workspace=backend"
    sudo -u ec2-user -H bash -c "cd ${APP_DIR} && npm run build --workspace=frontend"
    docker exec borrowbuy-proxy rm -rf /usr/share/nginx/html/*
    docker cp "${APP_DIR}/frontend/dist/." borrowbuy-proxy:/usr/share/nginx/html/
    docker exec borrowbuy-proxy nginx -s reload
    systemctl restart borrowbuy-backend.service
    log "Rollback completed to ${PREV_COMMIT}."
  else
    error "No previous commit available for rollback or commit unchanged."
  fi
  exit 1
}

# 8. Generate Prisma Client (Preserves existing PostgreSQL data on EBS)
log "Generating Prisma Database Client..."
sudo -u ec2-user -H bash -c "cd ${APP_DIR} && npx prisma generate --schema=./database/prisma/schema.prisma" || rollback

# 9. Build Backend TypeScript Application
log "Compiling TypeScript backend..."
sudo -u ec2-user -H bash -c "cd ${APP_DIR} && npm run build --workspace=backend" || rollback
test -f "${APP_DIR}/backend/dist/server.js" || { error "backend/dist/server.js not found!"; rollback; }

# 10. Build Frontend Production SPA Bundle
log "Compiling React Frontend production bundle..."
sudo -u ec2-user -H bash -c "cd ${APP_DIR} && npm run build --workspace=frontend" || rollback
test -f "${APP_DIR}/frontend/dist/index.html" || { error "frontend/dist/index.html not found!"; rollback; }

# Restore full ownership to ec2-user for all build outputs
chown -R ec2-user:ec2-user "${APP_DIR}"

# 11. Deploy Frontend Assets to Nginx Reverse Proxy
log "Deploying static assets to Nginx container (borrowbuy-proxy)..."
docker exec borrowbuy-proxy rm -rf /usr/share/nginx/html/*
docker cp "${APP_DIR}/frontend/dist/." borrowbuy-proxy:/usr/share/nginx/html/

# Ensure Nginx configuration includes origin verification, SPA fallback & /api/ proxy
ORIGIN_SECRET_FILE="/etc/borrowbuy/origin-secret"
if [ ! -f "${ORIGIN_SECRET_FILE}" ] && [ -f "${APP_DIR}/.origin-secret" ]; then
    ORIGIN_SECRET_FILE="${APP_DIR}/.origin-secret"
fi

if [ -f "${ORIGIN_SECRET_FILE}" ] && [ -s "${ORIGIN_SECRET_FILE}" ]; then
    log "Configuring Nginx with strict X-Origin-Verify header validation..."
    ORIGIN_SECRET=$(tr -d '\r\n' < "${ORIGIN_SECRET_FILE}")
    cat << EOF > /tmp/borrowbuy-nginx.conf
server {
    listen 80;
    server_name _;
    client_max_body_size 20M;

    location / {
        if (\$http_x_origin_verify != "${ORIGIN_SECRET}") {
            return 403 '{"error":"Forbidden","message":"Direct origin access denied. Valid X-Origin-Verify header required."}\n';
        }
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        if (\$http_x_origin_verify != "${ORIGIN_SECRET}") {
            return 403 '{"error":"Forbidden","message":"Direct origin access denied. Valid X-Origin-Verify header required."}\n';
        }
        proxy_pass http://172.17.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
else
    log "No origin secret file found; configuring standard Nginx reverse proxy..."
    cat << 'EOF' > /tmp/borrowbuy-nginx.conf
server {
    listen 80;
    server_name _;
    client_max_body_size 20M;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://172.17.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
fi

docker cp /tmp/borrowbuy-nginx.conf borrowbuy-proxy:/etc/nginx/conf.d/default.conf
docker exec borrowbuy-proxy nginx -t
docker exec borrowbuy-proxy nginx -s reload
rm -f /tmp/borrowbuy-nginx.conf

# 12. Restart Backend Systemd Service
log "Restarting borrowbuy-backend.service..."
systemctl restart borrowbuy-backend.service

# 13. Verify Post-Deployment Health & Service Availability
log "Performing post-deployment health verification..."
MAX_RETRIES=15
RETRY_COUNT=0
HEALTHY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  log "Health verification attempt ${RETRY_COUNT}/${MAX_RETRIES}..."
  if bash "${APP_DIR}/scripts/health-check.sh"; then
    HEALTHY=true
    log "Application health confirmed on attempt ${RETRY_COUNT}."
    break
  fi
  sleep 2
done

if [ "$HEALTHY" != "true" ]; then
  error "Backend and application health check failed after ${MAX_RETRIES} attempts!"
  rollback
fi

# 14. Record Successful Deployment
echo "${TIMESTAMP} | SHA: ${DEPLOYED_SHA} | SUCCESS | Target: ${TARGET_COMMIT}" >> "${APP_DIR}/deployments.log"
chown ec2-user:ec2-user "${APP_DIR}/deployments.log" 2>/dev/null || true
log "=========================================================="
log "BorrowBuy Deployment SUCCESSFUL: SHA ${DEPLOYED_SHA}"
log "=========================================================="
exit 0
