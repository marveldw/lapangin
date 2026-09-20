#!/bin/sh
set -e

# Setup storage directory structure and permissions
mkdir -p /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/logs \
         /var/www/html/bootstrap/cache

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Ensure storage symlink exists
php artisan storage:link --force || true

# Production caches (dramatically reduces per-request CPU and memory overhead on small VPS)
echo "[Entrypoint] Caching configuration, routes, and views for production..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Start PHP-FPM in foreground
echo "[Entrypoint] Starting PHP-FPM on port 9000..."
exec php-fpm -F
