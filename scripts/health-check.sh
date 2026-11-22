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

echo "=== BORROWBUY POST-DEPLOYMENT HEALTH VERIFICATION ==="

# 1. Backend Health Check
echo -n "Checking Backend API (${HEALTH_URL})... "
HEALTH_RESP=$(curl -s -f "${HEALTH_URL}" || echo "")
if echo "${HEALTH_RESP}" | grep -q '"status":"healthy"'; then
  echo "PASSED [200 OK]"
  echo "Response: ${HEALTH_RESP}"
else
  echo "FAILED!"
  exit 1
fi

# 2. Database Connectivity via Products API
echo -n "Checking PostgreSQL Database Connectivity (${PRODUCTS_URL})... "
PROD_RESP=$(curl -s -f "${PRODUCTS_URL}" || echo "")
if echo "${PROD_RESP}" | grep -q '"success":true'; then
  TOTAL_PRODUCTS=$(echo "${PROD_RESP}" | grep -o '"total":[0-9]*' | cut -d':' -f2 || echo "unknown")
  echo "PASSED [200 OK] (Total Products: ${TOTAL_PRODUCTS})"
else
  echo "FAILED!"
  exit 1
fi

# 3. Frontend SPA Serving
echo -n "Checking Frontend React Assets (${FRONTEND_URL})... "
FRONTEND_RESP=$(curl -s "${FRONTEND_URL}" || echo "")
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
