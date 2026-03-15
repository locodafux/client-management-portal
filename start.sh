#!/bin/bash
# start.sh

echo "========================================"
echo "Starting Laravel application with QUEUE WORKER"
echo "========================================"
echo "Current directory: $(pwd)"
echo "PHP Version: $(php -v | head -n 1)"
echo "========================================"

export HTTPS=true
export REQUEST_SCHEME=https

# Set display errors for debugging
sed -i 's/display_errors = Off/display_errors = On/g' /usr/local/etc/php/php.ini-production
cp /usr/local/etc/php/php.ini-production /usr/local/etc/php/php.ini

# Create necessary directories
echo "Creating storage directories..."
mkdir -p storage/app/imports storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache
echo "Directories ready"

# Wait for database to be ready
echo "Waiting for database connection..."
max_attempts=30
attempt=1
while [ $attempt -le $max_attempts ]; do
    php artisan db:monitor > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "Database connected successfully"
        break
    fi
    echo "Attempt $attempt/$max_attempts: Database not ready yet..."
    sleep 2
    attempt=$((attempt + 1))
done

# Check if assets exist
echo "Checking frontend assets..."
if [ -d "public/build" ]; then
    echo "Assets found in public/build"
else
    echo "public/build directory not found"
fi

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Run seeders
echo "Running seeders..."
php artisan db:seed --force

# Clear and regenerate cache
echo "Clearing config cache..."
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo "Generating optimized cache..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start Queue Worker in Background
echo "Starting queue worker in background..."
php artisan queue:work --tries=3 --daemon &
WORKER_PID=$!
echo "Queue worker started with PID: $WORKER_PID"

sleep 2
if kill -0 $WORKER_PID 2>/dev/null; then
    echo "Worker is running successfully"
else
    echo "Worker failed to start. Checking logs..."
    tail -n 20 storage/logs/laravel.log || true
fi

echo "========================================"
echo "Setup complete! Starting server..."
echo "========================================"

# Start Laravel server
exec php artisan serve --host=0.0.0.0 --port=${PORT:-10000}