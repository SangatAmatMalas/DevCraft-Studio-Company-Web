# syntax=docker/dockerfile:1

# Tool images are declared as stages so the build works with Podman's classic
# builder as well as BuildKit/Railway.
FROM docker.io/library/composer:2 AS composer

FROM docker.io/library/node:22-bookworm-slim AS nodejs

# ---------------------------------------------------------------------------
# 1. Frontend + Inertia SSR bundle
# ---------------------------------------------------------------------------
FROM nodejs AS assets

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY vite.config.js tsconfig.json ./
COPY resources ./resources
COPY public ./public

RUN npm run build:ssr

# The SSR bundle keeps bare imports (react, @inertiajs/react, …) external, so
# the runtime image needs the production node_modules tree.
FROM nodejs AS nodeprod

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# ---------------------------------------------------------------------------
# 2. PHP base with the extensions Laravel, MySQL, and image uploads need
# ---------------------------------------------------------------------------
FROM docker.io/library/php:8.4-fpm-bookworm AS phpbase

ENV COMPOSER_ALLOW_SUPERUSER=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        nginx \
        supervisor \
        gettext-base \
        curl \
        libcurl4-openssl-dev \
        libfreetype6-dev \
        libicu-dev \
        libjpeg62-turbo-dev \
        libonig-dev \
        libpng-dev \
        libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        curl \
        exif \
        gd \
        intl \
        mbstring \
        opcache \
        pcntl \
        pdo_mysql \
        zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Node is only needed at runtime to serve the Inertia SSR bundle.
COPY --from=nodejs /usr/local/bin/node /usr/local/bin/node
COPY --from=composer /usr/bin/composer /usr/local/bin/composer

# ---------------------------------------------------------------------------
# 3. Application + Composer dependencies
# ---------------------------------------------------------------------------
FROM phpbase AS app

WORKDIR /var/www

COPY composer.json composer.lock ./
RUN composer install \
        --no-dev \
        --no-interaction \
        --no-progress \
        --prefer-dist \
        --optimize-autoloader \
        --no-scripts

COPY . .

RUN composer dump-autoload --no-dev --optimize --no-scripts \
    && php artisan package:discover --ansi

# ---------------------------------------------------------------------------
# 4. Runtime image
# ---------------------------------------------------------------------------
FROM phpbase AS runtime

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    PORT=8080

WORKDIR /var/www

COPY --from=app /var/www /var/www
COPY --from=assets /app/public/build /var/www/public/build
COPY --from=assets /app/bootstrap/ssr /var/www/bootstrap/ssr
COPY --from=nodeprod /app/node_modules /var/www/node_modules

COPY docker/php.ini /usr/local/etc/php/conf.d/zz-devcraft.ini
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker/supervisord.conf /etc/supervisor/conf.d/devcraft.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint

RUN chmod +x /usr/local/bin/entrypoint \
    && rm -f /etc/nginx/sites-enabled/default \
    && mkdir -p \
        storage/app/public \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8080

ENTRYPOINT ["entrypoint"]
CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]
