#!/usr/bin/env bash
# ==============================================================================
# BorrowBuy Equipment Rental Platform - EC2 Deployment Script
# ==============================================================================
# Executed on EC2 host i-03347c2b6584c73cb via AWS Systems Manager (SSM)
# Preserves PostgreSQL on EBS, rebuilds backend & frontend, updates Nginx,
# verifies health, and performs automatic rollback on failure.
# ==============================================================================

set -eo pipefail

APP_DIR="/home/ec2-user/app"
DEPLOY_LOG="/var/log/borrowbuy-deploy.log"
PREV_COMMIT_FILE="${APP_DIR}/.prev_commit"
TARGET_COMMIT="${1:-HEAD}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

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
sudo touch "${DEPLOY_LOG}"
sudo chmod 666 "${DEPLOY_LOG}"

cd "${APP_DIR}"

# 1. Validate Target Commit Input (Prevent Shell Injection & Invalid SHAs)
if [ -n "${TARGET_COMMIT}" ] && [ "${TARGET_COMMIT}" != "HEAD" ]; then
  if [[ ! "${TARGET_COMMIT}" =~ ^[0-9a-fA-F]{7,40}$ ]]; then
    error "Invalid TARGET_COMMIT '${TARGET_COMMIT}'. Must be 'HEAD' or a 7-40 character hexadecimal Git commit SHA."
    exit 1
  fi
fi

# 2. Record pre-deployment commit SHA for rollback
PREV_COMMIT=$(git rev-parse HEAD || echo "")
echo "${PREV_COMMIT}" > "${PREV_COMMIT_FILE}"
log "Current commit recorded for rollback: ${PREV_COMMIT}"

# 3. Configure Git safe directory & fetch latest code
git config --global --add safe.directory "${APP_DIR}"
log "Fetching latest commits from origin..."
git fetch origin main

# Clean any uncommitted working changes to guarantee clean checkout
git reset --hard HEAD || true

if [ "${TARGET_COMMIT}" != "HEAD" ]; then
  log "Checking out target commit: ${TARGET_COMMIT}..."
  git checkout "${TARGET_COMMIT}"
else
  log "Checking out origin/main..."
  git checkout origin/main
fi

DEPLOYED_SHA=$(git rev-parse HEAD)
log "Checked out commit SHA: ${DEPLOYED_SHA}"

# Verify deployed commit matches target commit
if [ "${TARGET_COMMIT}" != "HEAD" ]; then
  if [[ "${DEPLOYED_SHA}" != "${TARGET_COMMIT}"* ]]; then
    error "Commit SHA mismatch! Checked out '${DEPLOYED_SHA}' does not match target '${TARGET_COMMIT}'."
    exit 1
  fi
fi

# 4. Safe Rollback Function
rollback() {
  error "Deployment verification failed! Initiating automatic rollback..."
  if [ -n "${PREV_COMMIT}" ] && [ "${PREV_COMMIT}" != "${DEPLOYED_SHA}" ]; then
    log "Rolling back to previous working commit: ${PREV_COMMIT}..."
    git checkout "${PREV_COMMIT}"
    npx prisma generate --schema=./database/prisma/schema.prisma
    npm run build --workspace=backend
    npm run build --workspace=frontend
    docker exec borrowbuy-proxy rm -rf /usr/share/nginx/html/*
    docker cp "${APP_DIR}/frontend/dist/." borrowbuy-proxy:/usr/share/nginx/html/
    docker exec borrowbuy-proxy nginx -s reload
    sudo systemctl restart borrowbuy-backend.service
    log "Rollback completed to ${PREV_COMMIT}."
  else
    error "No previous commit available for rollback or commit unchanged."
  fi
  exit 1
}

# 5. Generate Prisma Client (Preserves existing PostgreSQL data on EBS)
log "Generating Prisma Database Client..."
npx prisma generate --schema=./database/prisma/schema.prisma || rollback

# 6. Build Backend TypeScript Application
log "Compiling TypeScript backend..."
npm run build --workspace=backend || rollback
test -f "${APP_DIR}/backend/dist/server.js" || { error "backend/dist/server.js not found!"; rollback; }

# 7. Build Frontend Production SPA Bundle
log "Compiling React Frontend production bundle..."
npm run build --workspace=frontend || rollback
test -f "${APP_DIR}/frontend/dist/index.html" || { error "frontend/dist/index.html not found!"; rollback; }

# 8. Deploy Frontend Assets to Nginx Reverse Proxy
log "Deploying static assets to Nginx container (borrowbuy-proxy)..."
docker exec borrowbuy-proxy rm -rf /usr/share/nginx/html/*
docker cp "${APP_DIR}/frontend/dist/." borrowbuy-proxy:/usr/share/nginx/html/

# Ensure Nginx configuration includes SPA fallback & /api/ proxy
cat << 'EOF' > /tmp/borrowbuy-nginx.conf
server {
    listen 80;
    server_name _;

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
    }
}
EOF
docker cp /tmp/borrowbuy-nginx.conf borrowbuy-proxy:/etc/nginx/conf.d/default.conf
docker exec borrowbuy-proxy nginx -s reload

# 9. Restart Backend Systemd Service
log "Restarting borrowbuy-backend.service..."
sudo systemctl restart borrowbuy-backend.service

# 10. Verify Post-Deployment Health & Service Availability
log "Performing post-deployment health checks..."
HEALTH_URL="http://127.0.0.1:80/api/health"
FRONTEND_URL="http://127.0.0.1:80/"
MAX_RETRIES=15
RETRY_COUNT=0
HEALTHY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  log "Health probe ${RETRY_COUNT}/${MAX_RETRIES} to ${HEALTH_URL}..."
  
  HTTP_CODE=$(curl -s -o /tmp/health_resp.json -w "%{http_code}" "${HEALTH_URL}" || echo "000")
  if [ "$HTTP_CODE" = "200" ]; then
    if grep -q '"status":"healthy"' /tmp/health_resp.json; then
      HEALTHY=true
      log "Backend health confirmed (HTTP 200 OK): $(cat /tmp/health_resp.json)"
      break
    fi
  fi
  sleep 2
done

if [ "$HEALTHY" != "true" ]; then
  error "Backend health check failed after ${MAX_RETRIES} attempts!"
  rollback
fi

# 11. Verify Frontend Assets are Served
FRONTEND_CODE=$(curl -s -o /tmp/fe_resp.html -w "%{http_code}" "${FRONTEND_URL}")
if [ "$FRONTEND_CODE" = "200" ] && grep -q "BorrowBuy" /tmp/fe_resp.html; then
  log "Frontend verified (HTTP 200 OK with BorrowBuy title)."
else
  error "Frontend verification failed (HTTP code: ${FRONTEND_CODE})!"
  rollback
fi

# 12. Record Successful Deployment
echo "${TIMESTAMP} | SHA: ${DEPLOYED_SHA} | SUCCESS | Target: ${TARGET_COMMIT}" >> "${APP_DIR}/deployments.log"
log "=========================================================="
log "BorrowBuy Deployment SUCCESSFUL: SHA ${DEPLOYED_SHA}"
log "=========================================================="
exit 0
