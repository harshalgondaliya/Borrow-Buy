#!/usr/bin/env bash
# ==============================================================================
# BorrowBuy - EC2 Emergency Rollback Script
# ==============================================================================
# Restores application to previous known-good commit recorded in .prev_commit.
# Hardened for non-interactive SSM execution and safe Git repository ownership.
# ==============================================================================

set -eo pipefail

APP_DIR="/home/ec2-user/app"
DEPLOY_LOG="/var/log/borrowbuy-deploy.log"
PREV_COMMIT_FILE="${APP_DIR}/.prev_commit"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "[${TIMESTAMP}] [ROLLBACK] Initiating rollback procedure..." | tee -a "${DEPLOY_LOG}"

# Ensure proper environment variables for non-interactive SSM execution
export HOME="/home/ec2-user"
export USER="ec2-user"
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

cd "${APP_DIR}"

# Configure Git safe.directory strictly for APP_DIR
if ! git config --system --get-all safe.directory 2>/dev/null | grep -Fxq "${APP_DIR}"; then
  git config --system --add safe.directory "${APP_DIR}" || true
fi
git config --global --add safe.directory "${APP_DIR}" 2>/dev/null || true
sudo -u ec2-user -H git config --global --add safe.directory "${APP_DIR}" 2>/dev/null || true

if [ ! -f "${PREV_COMMIT_FILE}" ]; then
  echo "[${TIMESTAMP}] [ERROR] No previous commit record found at ${PREV_COMMIT_FILE}!" | tee -a "${DEPLOY_LOG}"
  exit 1
fi

TARGET_COMMIT=$(cat "${PREV_COMMIT_FILE}" | tr -d ' \n\r')

if [ -z "${TARGET_COMMIT}" ]; then
  echo "[${TIMESTAMP}] [ERROR] Target rollback commit is empty!" | tee -a "${DEPLOY_LOG}"
  exit 1
fi

if [[ ! "${TARGET_COMMIT}" =~ ^[0-9a-fA-F]{7,40}$ ]]; then
  echo "[${TIMESTAMP}] [ERROR] Invalid rollback commit SHA: '${TARGET_COMMIT}'!" | tee -a "${DEPLOY_LOG}"
  exit 1
fi

echo "[${TIMESTAMP}] [ROLLBACK] Checking out previous known-good commit: ${TARGET_COMMIT}..." | tee -a "${DEPLOY_LOG}"
chown -R ec2-user:ec2-user "${APP_DIR}"
sudo -u ec2-user -H git -C "${APP_DIR}" reset --hard HEAD || true
sudo -u ec2-user -H git -C "${APP_DIR}" checkout "${TARGET_COMMIT}"

echo "[${TIMESTAMP}] [ROLLBACK] Rebuilding application..." | tee -a "${DEPLOY_LOG}"
sudo -u ec2-user -H bash -c "cd ${APP_DIR} && npx prisma generate --schema=./database/prisma/schema.prisma"
sudo -u ec2-user -H bash -c "cd ${APP_DIR} && npm run build --workspace=backend"
sudo -u ec2-user -H bash -c "cd ${APP_DIR} && npm run build --workspace=frontend"
chown -R ec2-user:ec2-user "${APP_DIR}"

echo "[${TIMESTAMP}] [ROLLBACK] Restoring Nginx assets..." | tee -a "${DEPLOY_LOG}"
docker exec borrowbuy-proxy rm -rf /usr/share/nginx/html/*
docker cp "${APP_DIR}/frontend/dist/." borrowbuy-proxy:/usr/share/nginx/html/
docker exec borrowbuy-proxy nginx -s reload

echo "[${TIMESTAMP}] [ROLLBACK] Restarting backend service..." | tee -a "${DEPLOY_LOG}"
systemctl restart borrowbuy-backend.service

# Run health check
sleep 3
bash "${APP_DIR}/scripts/health-check.sh"

echo "[${TIMESTAMP}] [ROLLBACK] Successfully restored application to commit ${TARGET_COMMIT}." | tee -a "${DEPLOY_LOG}"
echo "${TIMESTAMP} | SHA: ${TARGET_COMMIT} | ROLLBACK_SUCCESS" >> "${APP_DIR}/deployments.log"
chown ec2-user:ec2-user "${APP_DIR}/deployments.log" 2>/dev/null || true
exit 0
