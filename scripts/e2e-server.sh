#!/usr/bin/env bash
# Boots a disposable SQLite database and the app for Playwright E2E runs.
set -euo pipefail

cd "$(dirname "$0")/.."

export DB_CONNECTION="${DB_CONNECTION:-sqlite}"
export DB_DATABASE="${DB_DATABASE:-database/e2e.sqlite}"

touch "$DB_DATABASE"

php artisan migrate:fresh --seed --force
# Rate limit counters live in the file cache; clear them so repeated runs don't hit 429.
php artisan cache:clear
php artisan serve --host=127.0.0.1 --port=8124
