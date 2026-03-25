#!/bin/sh

if [ ! -f "$SSL_CERT" ] || [ ! -f "$SSL_KEY" ]; then
    echo "SSL Certificates not found at $SSL_CERT. Generating self-signed certs..."
    mkdir -p "$(dirname "$SSL_CERT")"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SSL_KEY" \
        -out "$SSL_CERT" \
        -subj "/C=BR/ST=SP/L=SP/O=42/CN=localhost"
fi