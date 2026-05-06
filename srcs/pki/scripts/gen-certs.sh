#!/bin/sh
set -e

CERTS_DIR="/certs"
# Use environment variables passed from docker-compose
CA_KEY="$CERTS_DIR/${CA_KEY_NAME}"
CA_CRT="$CERTS_DIR/${CA_CRT_NAME}"
INT_KEY="$CERTS_DIR/${INT_KEY_NAME}"
INT_CSR="$CERTS_DIR/internal.csr"
INT_CRT="$CERTS_DIR/${INT_CRT_NAME}"
SAN_CONF="$CERTS_DIR/san.cnf"

# 1. Skip if already generated to maintain trust across restarts
if [ -f "$CA_CRT" ]; then
    echo "Certificates already exist in volume. Skipping generation."
    exit 0
fi

echo "Generating Root CA..."
openssl genrsa -out "$CA_KEY" 4096
openssl req -x509 -new -nodes -key "$CA_KEY" -sha256 -days 3650 -out "$CA_CRT" -subj "/CN=Transcendence Internal CA/O=Transcendence/C=BR"

echo "Generating Internal Server Key..."
openssl genrsa -out "$INT_KEY" 2048

echo "Creating SAN configuration..."
cat > "$SAN_CONF" <<EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
req_extensions = req_ext
distinguished_name = dn

[dn]
C = BR
O = Transcendence
CN = internal-services

[req_ext]
subjectAltName = @alt_names

[alt_names]
# Bare service names used by Docker Compose internal DNS
DNS.1 = loki
DNS.2 = promtail
DNS.3 = backend
DNS.4 = database
DNS.5 = prometheus
DNS.6 = gateway
DNS.7 = grafana
DNS.8 = data-service
DNS.9 = frontend
DNS.10 = mysqld-exporter
DNS.11 = node-exporter
DNS.12 = cadvisor
DNS.13 = nginx-exporter-gateway
EOF

echo "Generating Certificate Signing Request (CSR)..."
openssl req -new -key "$INT_KEY" -out "$INT_CSR" -config "$SAN_CONF"

echo "Generating Internal Certificate signed by Root CA..."
openssl x509 -req -in "$INT_CSR" -CA "$CA_CRT" -CAkey "$CA_KEY" -CAcreateserial -out "$INT_CRT" -days 3650 -sha256 -extfile "$SAN_CONF" -extensions req_ext

# Clean up temporary files
rm -f "$INT_CSR" "$SAN_CONF" "$CERTS_DIR"/*.srl

echo "Setting standard file permissions..."
chmod 644 "$CERTS_DIR"/*.crt
chmod 644 "$INT_KEY"
chmod 600 "$CA_KEY"

echo "PKI Initialization Complete."