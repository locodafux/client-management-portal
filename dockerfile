FROM php:8.2-cli

WORKDIR /var/www

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    nodejs \
    npm \
    libzip-dev

RUN docker-php-ext-install pdo pdo_mysql zip

# Install composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy app
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Install Node dependencies and build frontend
RUN npm install
RUN npm run build

# Laravel setup
RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan view:cache
RUN php artisan storage:link || true

EXPOSE 10000

CMD php artisan serve --host=0.0.0.0 --port=10000