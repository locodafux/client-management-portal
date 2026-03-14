FROM php:8.2-cli

RUN apt-get update && apt-get install -y git unzip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer diagnose

RUN composer install --no-dev --verbose