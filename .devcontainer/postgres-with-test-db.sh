#!/bin/sh
set -eu
export PGPASSWORD="${POSTGRES_PASSWORD:-postgres}"

docker-entrypoint.sh postgres &
postgres_pid=$!

forward_and_wait() {
  kill "$postgres_pid" 2>/dev/null || true
  wait "$postgres_pid"
}

cleanup() {
  if kill -0 "$postgres_pid" 2>/dev/null; then
    kill "$postgres_pid" 2>/dev/null || true
    wait "$postgres_pid" 2>/dev/null || true
  fi
}

trap cleanup EXIT
trap 'forward_and_wait' INT TERM

until psql -U postgres -d postgres -c "SELECT 1" >/dev/null 2>&1; do
  sleep 1
done

if ! psql -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'helpingyou_test'" | grep -q 1; then
  psql -U postgres -d postgres -c "CREATE DATABASE helpingyou_test"
fi

wait "$postgres_pid"
