#!/bin/sh
set -eu

CADVISOR_PID=""
NGINX_PID=""

/usr/bin/cadvisor \
    --listen_ip=127.0.0.1 \
    --port=18080 \
    --prometheus_endpoint=/metrics \
    --docker_only=true \
    --store_container_labels=false \
    --logtostderr=true &
CADVISOR_PID=$!

nginx -g 'pid /tmp/nginx.pid; daemon off;' &
NGINX_PID=$!

cleanup() {
    kill -TERM "$CADVISOR_PID" "$NGINX_PID" 2>/dev/null || true
    wait "$CADVISOR_PID" 2>/dev/null || true
    wait "$NGINX_PID" 2>/dev/null || true
}

trap cleanup INT TERM

while true; do
    if ! kill -0 "$CADVISOR_PID" 2>/dev/null; then
        cleanup
        exit 1
    fi

    if ! kill -0 "$NGINX_PID" 2>/dev/null; then
        cleanup
        exit 1
    fi

    sleep 2
done