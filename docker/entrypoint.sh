#!/usr/bin/env bash
set -euo pipefail

cd /var/www

PORT="${PORT:-8080}"
export PORT

if [ -z "${APP_KEY:-}" ]; then
    cat >&2 <<'MSG'
APP_KEY is not set.

Generate one locally with:

    php artisan key:generate --show

then add it to the platform variables (Railway / Cloud Run) before deploying.
MSG
    exit 1
fi

# Railway's MySQL plugin exposes MYSQL_URL. Laravel understands DB_URL, so map
# it unless the service already defines DB_URL explicitly.
if [ -z "${DB_URL:-}" ] && [ -n "${MYSQL_URL:-}" ]; then
    export DB_URL="$MYSQL_URL"
fi
if [ -z "${DB_URL:-}" ] && [ -n "${DATABASE_URL:-}" ]; then
    export DB_URL="$DATABASE_URL"
fi

# Cloud Run exposes Cloud SQL through a Unix socket instead of a TCP host.
# CLOUD_SQL_CONNECTION_NAME is project:region:instance.
if [ -z "${DB_SOCKET:-}" ] && [ -n "${CLOUD_SQL_CONNECTION_NAME:-}" ]; then
    export DB_SOCKET="/cloudsql/${CLOUD_SQL_CONNECTION_NAME}"
fi

# Render the nginx config with the port assigned by the platform. Only PORT is
# substituted so nginx variables such as $uri stay intact.
envsubst '${PORT}' </etc/nginx/templates/default.conf.template >/etc/nginx/conf.d/default.conf

mkdir -p \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

# On Cloud Run the public storage directory can be a Cloud Storage mount. A
# recursive chown across a FUSE mount is slow and may fail, so only chown the
# writable directories outside the mount.
if [ "${CLOUD_STORAGE_MOUNT:-false}" = "true" ]; then
    chown -R www-data:www-data storage/framework storage/logs bootstrap/cache 2>/dev/null || true
else
    chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true
fi

# Drop any config cached during the image build; runtime env must win.
php artisan config:clear >/dev/null 2>&1 || true
php artisan route:clear >/dev/null 2>&1 || true
php artisan view:clear >/dev/null 2>&1 || true

# Migrations run on boot by default. On Cloud Run with more than one instance,
# set RUN_MIGRATIONS=false and run migrations as a Cloud Run Job instead.
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    attempts=0
    until php artisan migrate --force --no-interaction; do
        attempts=$((attempts + 1))

        if [ "$attempts" -ge 60 ]; then
            echo "Database is still unreachable after ${attempts} attempts; aborting." >&2
            exit 1
        fi

        echo "Waiting for the database (attempt ${attempts}/60)..."
        sleep 2
    done
else
    echo "RUN_MIGRATIONS=false; skipping migrations."
fi

# Creates the first super admin only when the users table is still empty.
if [ "${RUN_ADMIN_BOOTSTRAP:-true}" = "true" ]; then
    php artisan app:ensure-admin --no-interaction
fi

php artisan storage:link --force >/dev/null 2>&1 || true

php artisan config:cache
php artisan route:cache
php artisan view:cache

exec "$@"
