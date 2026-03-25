#!/bin/sh

if [ ! -f "$SSL_CERT" ] || [ ! -f "$SSL_KEY" ]; then
    echo "SSL Certificates not found at $SSL_CERT."
    echo "Generating internal self-signed certs at /etc/nginx/ssl/..."

    mkdir -p /etc/nginx/ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/self_signed.key \
        -out /etc/nginx/ssl/self_signed.crt \
        -subj "/C=BR/ST=SP/L=SP/O=42/CN=localhost"

    export SSL_CERT="/etc/nginx/ssl/self_signed.crt"
    export SSL_KEY="/etc/nginx/ssl/self_signed.key"
fi
