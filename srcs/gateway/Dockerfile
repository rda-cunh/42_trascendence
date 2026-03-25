FROM nginx:alpine

# Install openssl and create the directory for the SSL certificate
RUN apk add --no-cache openssl

COPY ./generate_certs.sh /docker-entrypoint.d/01-generate-certs.sh
RUN chmod +x /docker-entrypoint.d/01-generate-certs.sh
