#!/usr/bin/env bash
# ==============================================================================
# BorrowBuy - EC2 Emergency Rollback Script
# ==============================================================================

set -eo pipefail

APP_DIR="/home/ec2-user/app"
DEPLOY_LOG="/var/log/borrowbuy-deploy.log"
PREV_COMMIT_FILE="${APP_DIR}/.prev_commit"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "[${TIMESTAMP}] [ROLLBACK] Initiating rollback procedure..." | sudo tee -a "${DEPLOY_LOG}"

# Ensure proper environment variables for non-interactive SSM execution
export HOME="/home/ec2-user"
export USER="ec2-user"
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

cd "${APP_DIR}"

if [ ! -f "${PREV_COMMIT_FILE}" ]; then
  echo "[${TIMESTAMP}] [ERROR] No previous commit record found at ${PREV_COMMIT_FILE}!" | sudo tee -a "${DEPLOY_LOG}"
  exit 1
fi

TARGET_COMMIT=$(cat "${PREV_COMMIT_FILE}" | tr -d ' \n\r')

if [ -z "${TARGET_COMMIT}" ]; then
  echo "[${TIMESTAMP}] [ERROR] Target rollback commit is empty!" | sudo tee -a "${DEPLOY_LOG}"
  exit 1
fi

if [[ ! "${TARGET_COMMIT}" =~ ^[0-9a-fA-F]{7,40}$ ]]; then
  echo "[${TIMESTAMP}] [ERROR] Invalid rollback commit SHA: '${TARGET_COMMIT}'!" | sudo tee -a "${DEPLOY_LOG}"
  exit 1
fi

echo "[${TIMESTAMP}] [ROLLBACK] Checking out previous known-good commit: ${TARGET_COMMIT}..." | sudo tee -a "${DEPLOY_LOG}"
git reset --hard HEAD || true
git checkout "${TARGET_COMMIT}"

echo "[${TIMESTAMP}] [ROLLBACK] Rebuilding application..." | sudo tee -a "${DEPLOY_LOG}"
npx prisma generate --schema=./database/prisma/schema.prisma
npm run build --workspace=backend
npm run build --workspace=frontend

echo "[${TIMESTAMP}] [ROLLBACK] Restoring Nginx assets..." | sudo tee -a "${DEPLOY_LOG}"
docker exec borrowbuy-proxy rm -rf /usr/share/nginx/html/*
docker cp "${APP_DIR}/frontend/dist/." borrowbuy-proxy:/usr/share/nginx/html/
docker exec borrowbuy-proxy nginx -s reload

echo "[${TIMESTAMP}] [ROLLBACK] Restarting backend service..." | sudo tee -a "${DEPLOY_LOG}"
sudo systemctl restart borrowbuy-backend.service

# Run health check
sleep 3
bash "${APP_DIR}/scripts/health-check.sh"

echo "[${TIMESTAMP}] [ROLLBACK] Successfully restored application to commit ${TARGET_COMMIT}." | sudo tee -a "${DEPLOY_LOG}"
echo "${TIMESTAMP} | SHA: ${TARGET_COMMIT} | ROLLBACK_SUCCESS" >> "${APP_DIR}/deployments.log"
exit 0
