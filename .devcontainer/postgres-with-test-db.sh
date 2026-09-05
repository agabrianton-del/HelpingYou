#!/bin/sh
set -eu
export PGPASSWORD="${POSTGRES_PASSWORD:-postgres}"
export PGHOST="${PGHOST:-127.0.0.1}"
db_user="${POSTGRES_USER:-postgres}"
db_name="${POSTGRES_DB:-helpingyou}"
test_db_name="${TEST_DATABASE_NAME:-helpingyou_test}"

case "$test_db_name" in
  ''|[!A-Za-z_]*|*[!A-Za-z0-9_]*)
    echo "Invalid TEST_DATABASE_NAME: use a PostgreSQL identifier with letters or underscores, followed by letters, numbers, or underscores." >&2
    exit 1
    ;;
esac

docker-entrypoint.sh "$@" &
postgres_pid=$!

stop_postgres() {
  pg_ctl -D "${PGDATA:-/var/lib/postgresql/data}" -m fast stop >/dev/null 2>&1 || true
  kill "$postgres_pid" 2>/dev/null || true
}

forward_and_wait() {
  stop_postgres
  set +e
  wait "$postgres_pid"
  status=$?
  set -e
  exit "$status"
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

if ! psql -U "$db_user" -d "$db_name" -tAc "SELECT 1 FROM pg_database WHERE datname = '$test_db_name'" | grep -q 1; then
  psql -U "$db_user" -d "$db_name" -c "CREATE DATABASE \"$test_db_name\""
fi

wait "$postgres_pid"
