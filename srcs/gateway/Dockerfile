FROM nginx:alpine

# Receive the project-relative paths exactly as defined in .env
ARG SSL_CERT
ARG SSL_KEY

# Set environment variables for the SSL certificate and key paths
ENV SSL_CERT=/${SSL_CERT}
ENV SSL_KEY=/${SSL_KEY}

# Install openssl and create the directory for the SSL certificate
RUN apk add --no-cache openssl && \
    mkdir -p $(dirname "$SSL_CERT")

COPY ./generate_certs.sh /docker-entrypoint.d/01-generate-certs.sh
RUN chmod +x /docker-entrypoint.d/01-generate-certs.sh
