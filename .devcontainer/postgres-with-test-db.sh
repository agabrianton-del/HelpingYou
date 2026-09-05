#!/bin/sh
set -eu

docker-entrypoint.sh postgres &
postgres_pid=$!

cleanup() {
  kill "$postgres_pid" 2>/dev/null || true
}

trap cleanup INT TERM

until pg_isready -U postgres -d helpingyou >/dev/null 2>&1; do
  sleep 1
done

if ! psql -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'helpingyou_test'" | grep -q 1; then
  psql -U postgres -d postgres -c "CREATE DATABASE helpingyou_test"
fi

wait "$postgres_pid"
