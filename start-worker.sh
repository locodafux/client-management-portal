#!/bin/bash
echo "========================================"
echo "🚀 Queue Worker Started at $(date)"
echo "========================================"
echo "Current user: $(whoami)"
echo "Working directory: $(pwd)"
echo "Script location: $(which php)"
echo "PHP version: $(php -v | head -n 1)"
echo "========================================"

# Test database connection
echo "Testing database connection..."
php artisan db:monitor
if [ $? -ne 0 ]; then
    echo "❌ Database connection failed!"
    exit 1
fi
echo "✅ Database connected!"

# Run queue worker
echo "Starting queue worker..."
php artisan queue:work --stop-when-empty --tries=3 --max-time=50

echo "✅ Queue worker finished at $(date)"
exit 0