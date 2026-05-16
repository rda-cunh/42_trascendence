FROM nginx:alpine

# Install openssl and create the directory for the SSL certificate
RUN apk add --no-cache openssl

COPY ./generate_certs.sh /docker-entrypoint.d/01-generate-certs.sh
RUN chmod +x /docker-entrypoint.d/01-generate-certs.sh

COPY ./set-frontend-target.envsh /docker-entrypoint.d/02-set-frontend-target.envsh
RUN chmod +x /docker-entrypoint.d/02-set-frontend-target.envsh