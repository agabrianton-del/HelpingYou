#!/bin/sh
set -eu

test_db_name="${TEST_DATABASE_NAME:-helpingyou_test}"
db_user="${POSTGRES_USER:-postgres}"
db_name="${POSTGRES_DB:-helpingyou}"
db_host="${PGHOST:-127.0.0.1}"

if ! printf '%s\n' "$test_db_name" | grep -Eq '^[A-Za-z_][A-Za-z0-9_]*$'; then
  echo "Invalid TEST_DATABASE_NAME: use a PostgreSQL identifier with letters or underscores, followed by letters, numbers, or underscores." >&2
  exit 1
fi

database_exists() {
  printf "SELECT 1 FROM pg_database WHERE datname = :'test_db_name'\n" |
    PGPASSWORD="${PGPASSWORD:-postgres}" psql -h "$db_host" -U "$db_user" -d "$db_name" -v test_db_name="$test_db_name" -tA |
    grep -q 1
}

until PGPASSWORD="${PGPASSWORD:-postgres}" psql -h "$db_host" -U "$db_user" -d "$db_name" -c "SELECT 1" >/dev/null 2>&1; do
  sleep 1
done

if ! database_exists; then
  create_status=0
  printf "SELECT format('CREATE DATABASE %%I', :'test_db_name') \\\\gexec\n" |
    PGPASSWORD="${PGPASSWORD:-postgres}" psql -h "$db_host" -U "$db_user" -d "$db_name" -v test_db_name="$test_db_name" ||
    create_status=$?
  if [ "$create_status" -ne 0 ] && ! database_exists; then
    exit "$create_status"
  fi
fi
