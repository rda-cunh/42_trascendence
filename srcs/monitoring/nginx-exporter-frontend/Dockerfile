ARG ALPINE_VERSION=3.20
ARG NGINX_PROMETHEUS_EXPORTER_VERSION=1.4.2

FROM nginx/nginx-prometheus-exporter:${NGINX_PROMETHEUS_EXPORTER_VERSION} as exporter

FROM alpine:${ALPINE_VERSION}

RUN apk add --no-cache ca-certificates

COPY --from=exporter /usr/bin/nginx-prometheus-exporter /bin/nginx-prometheus-exporter