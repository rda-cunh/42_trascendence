#!/bin/sh

mkdir -p /etc/nginx/ssl

if [ -f /run/secrets/ssl_cert ] && [ -f /run/secrets/ssl_key ]; then

    # Copy the generated certs from secrets to the nginx ssl directory
    cp /run/secrets/ssl_cert /etc/nginx/ssl/server.crt
    cp /run/secrets/ssl_key /etc/nginx/ssl/server.key

    # Generate self-signed certificates if not provided via secrets
    else
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/server.key \
        -out /etc/nginx/ssl/server.crt \
        -subj "/C=BR/ST=SP/L=SP/O=42/CN=localhost"

fi
