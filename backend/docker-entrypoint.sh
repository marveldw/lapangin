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

# Pastikan APP_KEY tersedia (wajib di-set via environment variable)
if [ -z "$APP_KEY" ]; then
    echo "[Entrypoint] ERROR: APP_KEY belum di-set! Masukkan via environment variable di Portainer."
    exit 1
fi

# Jalankan migrasi database dengan retry loop sampai DB siap
echo "[Entrypoint] Running database migrations..."
MAX_RETRIES=30
RETRY_COUNT=0
until php artisan migrate --force || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "[Entrypoint] Waiting for database connection... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "[Entrypoint] ERROR: Database migration failed after $MAX_RETRIES attempts."
    exit 1
fi

echo "[Entrypoint] Database migration completed successfully."

echo "[Entrypoint] Running database seeds..."
php artisan db:seed --force || true

# Publish assets and optimize for production
echo "[Entrypoint] Publishing assets and optimizing for production..."
php artisan filament:assets || true
php artisan livewire:publish --assets || true
php artisan optimize || true

# Pastikan kepemilikan file storage & logs selalu milik www-data setelah artisan commands
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Jalankan PHP-FPM di background
echo "[Entrypoint] Starting PHP-FPM..."
php-fpm -D

# Jalankan Nginx di foreground
echo "[Entrypoint] Starting Nginx on port 8000..."
exec nginx -g "daemon off;"
