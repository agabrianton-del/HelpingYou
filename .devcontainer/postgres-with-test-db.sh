#!/bin/sh
set -eu
export PGPASSWORD="${POSTGRES_PASSWORD:-postgres}"
export PGHOST="${PGHOST:-127.0.0.1}"
db_user="${POSTGRES_USER:-postgres}"
db_name="${POSTGRES_DB:-helpingyou}"
test_db_name="${TEST_DATABASE_NAME:-helpingyou_test}"

if ! printf '%s\n' "$test_db_name" | grep -Eq '^[A-Za-z_][A-Za-z0-9_]*$'; then
  echo "Invalid TEST_DATABASE_NAME: use a PostgreSQL identifier with letters or underscores, followed by letters, numbers, or underscores." >&2
  exit 1
fi

database_exists() {
  printf "SELECT 1 FROM pg_database WHERE datname = :'test_db_name'\n" |
    psql -U "$db_user" -d "$db_name" -v test_db_name="$test_db_name" -tA |
    grep -q 1
}

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

if ! database_exists; then
  if ! printf "SELECT format('CREATE DATABASE %%I', :'test_db_name') \\\\gexec\n" | psql -U "$db_user" -d "$db_name" -v test_db_name="$test_db_name"; then
    database_exists
  fi
fi

wait "$postgres_pid"
