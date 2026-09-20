# syntax=docker/dockerfile:1

# ==========================================
# STAGE 1: Install Composer Dependencies
# ==========================================
FROM composer:2 AS vendor

WORKDIR /app

RUN apk add --no-cache git

COPY backend/composer.json backend/composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --ignore-platform-reqs \
    --optimize-autoloader \
    --no-scripts \
    --no-progress

# ==========================================
# STAGE 2: PHP 8.2 FPM Alpine (Ultra-lean)
# ==========================================
FROM php:8.2-fpm-alpine AS runner

WORKDIR /var/www/html

# Install extension installer helper
ADD --chmod=755 https://github.com/mlocati/docker-php-extension-installer/releases/download/2.11.12/install-php-extensions /usr/local/bin/

# Install only essential production extensions: MySQL driver, GD, OPcache, BCMath, Zip, Intl
RUN install-php-extensions pdo_mysql gd opcache bcmath zip intl && \
    rm /usr/local/bin/install-php-extensions

# Use production php.ini
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Configure OPcache for low memory & high performance
RUN { \
    echo 'opcache.enable=1'; \
    echo 'opcache.memory_consumption=64'; \
    echo 'opcache.interned_strings_buffer=8'; \
    echo 'opcache.max_accelerated_files=10000'; \
    echo 'opcache.validate_timestamps=0'; \
    echo 'opcache.save_comments=1'; \
} > /usr/local/etc/php/conf.d/opcache-recommended.ini

# Copy custom low-memory PHP-FPM pool config
COPY docker/php/zz-docker.conf /usr/local/etc/php-fpm.d/zz-docker.conf

# Copy vendor from STAGE 1
COPY --from=vendor /app/vendor /var/www/html/vendor

# Copy application source code
COPY backend /var/www/html

# Copy entrypoint script
COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Setup storage directory permissions
RUN mkdir -p /var/www/html/storage/framework/cache/data \
             /var/www/html/storage/framework/sessions \
             /var/www/html/storage/framework/views \
             /var/www/html/storage/logs \
             /var/www/html/bootstrap/cache && \
    chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
    chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 9000

ENTRYPOINT ["entrypoint.sh"]
