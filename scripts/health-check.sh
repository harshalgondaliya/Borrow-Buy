#!/usr/bin/env bash
# ==============================================================================
# BorrowBuy - EC2 Health Check Verification Script
# ==============================================================================

set -eo pipefail

export HOME="/home/ec2-user"
export USER="ec2-user"
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

HEALTH_URL="http://127.0.0.1:80/api/health"
FRONTEND_URL="http://127.0.0.1:80/"
PRODUCTS_URL="http://127.0.0.1:80/api/products?limit=1"
BACKEND_DIRECT_URL="http://127.0.0.1:5000/api/health"

# Detect Origin Secret for Nginx header verification
ORIGIN_HEADER_ARG=()
ORIGIN_SECRET_FILE="/home/ec2-user/app/.origin-secret"
if [ ! -f "${ORIGIN_SECRET_FILE}" ] && [ -f "/etc/borrowbuy/origin-secret" ]; then
  ORIGIN_SECRET_FILE="/etc/borrowbuy/origin-secret"
fi

if [ -f "${ORIGIN_SECRET_FILE}" ] && [ -s "${ORIGIN_SECRET_FILE}" ]; then
  ORIGIN_HEADER_ARG=(-H "X-Origin-Verify: $(tr -d '\r\n' < "${ORIGIN_SECRET_FILE}")")
fi

echo "=== BORROWBUY POST-DEPLOYMENT HEALTH VERIFICATION ==="

# 1. Backend Health Check (via Nginx proxy with origin header)
echo -n "Checking Backend API via Nginx (${HEALTH_URL})... "
HEALTH_RESP=$(curl -s -f "${ORIGIN_HEADER_ARG[@]}" "${HEALTH_URL}" || echo "")
if echo "${HEALTH_RESP}" | grep -q '"status":"healthy"'; then
  echo "PASSED [200 OK]"
  echo "Response: ${HEALTH_RESP}"
else
  echo "FAILED!"
  exit 1
fi

# 1b. Direct Express Backend Check (bypass proxy on loopback)
echo -n "Checking Direct Express Backend (${BACKEND_DIRECT_URL})... "
BACKEND_RESP=$(curl -s -f "${BACKEND_DIRECT_URL}" || echo "")
if echo "${BACKEND_RESP}" | grep -q '"status":"healthy"'; then
  echo "PASSED [200 OK]"
else
  echo "FAILED!"
  exit 1
fi

# 2. Database Connectivity via Products API
echo -n "Checking PostgreSQL Database Connectivity (${PRODUCTS_URL})... "
PROD_RESP=$(curl -s -f "${ORIGIN_HEADER_ARG[@]}" "${PRODUCTS_URL}" || echo "")
if echo "${PROD_RESP}" | grep -q '"success":true'; then
  TOTAL_PRODUCTS=$(echo "${PROD_RESP}" | grep -o '"total":[0-9]*' | cut -d':' -f2 || echo "unknown")
  echo "PASSED [200 OK] (Total Products: ${TOTAL_PRODUCTS})"
else
  echo "FAILED!"
  exit 1
fi

# 3. Frontend SPA Serving
echo -n "Checking Frontend React Assets (${FRONTEND_URL})... "
FRONTEND_RESP=$(curl -s "${ORIGIN_HEADER_ARG[@]}" "${FRONTEND_URL}" || echo "")
if echo "${FRONTEND_RESP}" | grep -q 'BorrowBuy'; then
  echo "PASSED [200 OK]"
else
  echo "FAILED!"
  exit 1
fi

# 4. Systemd Service Status
echo -n "Checking Systemd Service (borrowbuy-backend.service)... "
if systemctl is-active --quiet borrowbuy-backend.service; then
  echo "ACTIVE [Running]"
else
  echo "INACTIVE!"
  exit 1
fi

# 5. Docker Containers Status
echo -n "Checking Nginx Proxy & PostgreSQL Docker Containers... "
RUNNING_CONTAINERS=$(docker ps --format "{{.Names}}" | tr '\n' ' ')
if echo "${RUNNING_CONTAINERS}" | grep -q "borrowbuy-proxy" && echo "${RUNNING_CONTAINERS}" | grep -q "borrowbuy-postgres"; then
  echo "RUNNING [${RUNNING_CONTAINERS}]"
else
  echo "CONTAINER MISSING! Running: ${RUNNING_CONTAINERS}"
  exit 1
fi

echo "=== ALL HEALTH CHECKS PASSED SUCCESSFULLY ==="
exit 0
