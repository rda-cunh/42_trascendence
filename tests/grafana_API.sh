#!/usr/bin/env bash

set -euo pipefail

CURL="curl --silent --show-error --insecure"
HEADER="Content-Type: application/json"
DOMAIN="https://127.0.0.1/"
DIR="grafana_tests/"

mkdir -p "$DIR"

# ---------- admin login ----------
echo -e "\e[1;34m/api/auth/login/ (admin) - POST\e[0m"

LOGIN='{"email": "adm@email.com", "password": "12345678"}'

curl --insecure --silent --show-error \
    -X POST "${DOMAIN}api/auth/login/" \
    -H "${HEADER}" \
    -d "$LOGIN" \
    -D "${DIR}admin_login.headers" \
    -c "${DIR}admin_cookies.txt" \
    -o "${DIR}admin_login.json" \
    -w "%{http_code}" > "${DIR}admin_login.status"

ADMIN_TOKEN=$(python3 -c "import json; print(json.load(open('${DIR}admin_login.json')).get('access',''))")
HTTP_STATUS=$(cat "${DIR}admin_login.status")

if [ "$HTTP_STATUS" != "200" ] || [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ Admin login failed (HTTP $HTTP_STATUS)"
    exit 1
fi
echo "✅ Admin login succeeded, token obtained."

# ---------- access /metrics/ with admin credentials ----------
echo -e "\e[1;34m/api/metrics/ (admin) - GET\e[0m"

# Use -L to follow Grafana's potential redirects (e.g., / -> /metrics/)
curl --insecure --silent --show-error \
    -L \
    -X GET "${DOMAIN}metrics/" \
    -H "${HEADER}" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -b "${DIR}admin_cookies.txt" \
    -o "${DIR}admin_metrics.html" \
    -w "%{http_code}" > "${DIR}admin_metrics.status"

HTTP_METRICS=$(cat "${DIR}admin_metrics.status")

if [ "$HTTP_METRICS" == "200" ]; then
    echo "✅ Successfully loaded Grafana metrics (HTTP 200)"
    echo "   Output saved to ${DIR}admin_metrics.html"
else
    echo "❌ Metrics request returned HTTP $HTTP_METRICS"
    echo "   Check ${DIR}admin_metrics.html for details"
    exit 1
fi

echo "Test completed successfully."