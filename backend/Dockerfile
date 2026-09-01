# syntax=docker/dockerfile:1

# ==========================================
# STAGE 1: Install Composer Dependencies
# ==========================================
FROM composer:2 AS vendor

WORKDIR /app

RUN apk add --no-cache git && \
    composer config -g source-fallback true && \
    composer config -g process-timeout 2000

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --ignore-platform-reqs \
    --optimize-autoloader \
    --no-scripts \
    --no-progress

# ==========================================
# STAGE 2: PHP 8.2 FPM Alpine + Nginx
# ==========================================
FROM php:8.2-fpm-alpine AS runner

WORKDIR /var/www/html

# Install Nginx
RUN apk add --no-cache nginx

# Install PHP extensions untuk Laravel + Filament (pinned version)
ADD --chmod=755 https://github.com/mlocati/docker-php-extension-installer/releases/download/2.11.12/install-php-extensions /usr/local/bin/

RUN install-php-extensions pdo_pgsql pgsql intl zip gd bcmath opcache pcntl && \
    rm /usr/local/bin/install-php-extensions

# Gunakan php.ini production untuk keamanan & performa
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Copy custom Nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy vendor dari STAGE 1
COPY --from=vendor /app/vendor /var/www/html/vendor

# Copy source code aplikasi
COPY . /var/www/html

# Hapus file Docker dari dalam image
RUN rm -rf /var/www/html/docker /var/www/html/Dockerfile /var/www/html/docker-entrypoint.sh

# Setup entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Setup storage & permissions untuk Laravel
RUN mkdir -p /var/www/html/storage/framework/cache/data \
             /var/www/html/storage/framework/sessions \
             /var/www/html/storage/framework/views \
             /var/www/html/storage/logs \
             /var/www/html/bootstrap/cache \
             /var/log/nginx \
             /run && \
    chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
    chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 8000

ENTRYPOINT ["docker-entrypoint.sh"]
