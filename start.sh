#!/bin/bash
# start.sh

echo "========================================"
echo "🚀 Starting Laravel application..."
echo "========================================"
echo "Current directory: $(pwd)"
echo "PHP Version: $(php -v | head -n 1)"
echo "========================================"
export HTTPS=true
export REQUEST_SCHEME=https
# Set display errors for debugging (remove in production)
sed -i 's/display_errors = Off/display_errors = On/g' /usr/local/etc/php/php.ini-production
cp /usr/local/etc/php/php.ini-production /usr/local/etc/php/php.ini

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
max_attempts=30
attempt=1
while [ $attempt -le $max_attempts ]; do
    php artisan db:monitor > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Database connected successfully!"
        break
    fi
    echo "⏳ Attempt $attempt/$max_attempts: Database not ready yet..."
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "⚠️ Could not connect to database after $max_attempts attempts. Continuing anyway..."
fi

# Check if assets exist
echo "📦 Checking frontend assets..."
if [ -d "public/build" ]; then
    echo "✅ Assets found in public/build"
    ls -la public/build/assets/ | head -5
else
    echo "⚠️ public/build directory not found!"
fi

# Run migrations
echo "🔄 Running migrations..."
php artisan migrate --force

# Run seeders (only if no users exist)
echo "🌱 Running seeders..."
php artisan db:seed --force

# Clear config cache
echo "🧹 Clearing config cache..."
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Generate optimized cache
echo "⚡ Generating optimized cache..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "========================================"
echo "✅ Setup complete! Starting server..."
echo "========================================"

# Start Laravel server
exec php artisan serve --host=0.0.0.0 --port=${PORT:-10000}