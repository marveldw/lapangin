#!/bin/sh
set -e

# Setup direktori yang dibutuhkan
mkdir -p /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/logs \
         /var/www/html/bootstrap/cache \
         /var/log/nginx \
         /run

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Pastikan APP_KEY tersedia (wajib di-set via environment variable)
if [ -z "$APP_KEY" ]; then
    echo "[Entrypoint] ERROR: APP_KEY belum di-set! Masukkan via environment variable di Portainer."
    exit 1
fi

# Jalankan migrasi dan seeder database
echo "[Entrypoint] Running database migrations..."
php artisan migrate --force || echo "[Entrypoint] Migration notice: Migration will run once database is ready."

echo "[Entrypoint] Running database seeds..."
php artisan db:seed --force || true

# Cache config, route, dan view untuk performa production
echo "[Entrypoint] Optimizing for production..."
php artisan optimize || true

# Jalankan PHP-FPM di background
echo "[Entrypoint] Starting PHP-FPM..."
php-fpm -D

# Jalankan Nginx di foreground
echo "[Entrypoint] Starting Nginx on port 8000..."
exec nginx -g "daemon off;"
