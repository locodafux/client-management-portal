# Use PHP 8.2 image
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files
COPY composer.json composer.lock ./

# Show composer.json content (for debugging)
RUN cat composer.json

# Set memory limit
ENV COMPOSER_MEMORY_LIMIT=-1

# Run install with verbose output
RUN composer install --no-dev --optimize-autoloader --no-interaction --verbose

# Copy the rest of the application
COPY . .

EXPOSE 9000
CMD ["php-fpm"]