#!/bin/sh
set -eu
export PGPASSWORD="${POSTGRES_PASSWORD:-postgres}"
db_user="${POSTGRES_USER:-postgres}"
db_name="${POSTGRES_DB:-helpingyou}"

docker-entrypoint.sh "$@" &
postgres_pid=$!

stop_postgres() {
  pg_ctl -D "${PGDATA:-/var/lib/postgresql/data}" -m fast stop >/dev/null 2>&1 || true
  kill "$postgres_pid" 2>/dev/null || true
}

forward_and_wait() {
  stop_postgres
  wait "$postgres_pid"
}

cleanup() {
  if kill -0 "$postgres_pid" 2>/dev/null; then
    stop_postgres
    wait "$postgres_pid" 2>/dev/null || true
  fi
}

trap cleanup EXIT
trap 'forward_and_wait' INT TERM

until psql -U "$db_user" -d "$db_name" -c "SELECT 1" >/dev/null 2>&1; do
  if ! kill -0 "$postgres_pid" 2>/dev/null; then
    wait "$postgres_pid"
    exit $?
  fi
  sleep 1
done

if ! psql -U "$db_user" -d "$db_name" -tAc "SELECT 1 FROM pg_database WHERE datname = 'helpingyou_test'" | grep -q 1; then
  psql -U "$db_user" -d "$db_name" -c "CREATE DATABASE helpingyou_test"
fi

wait "$postgres_pid"
