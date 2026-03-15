#!/bin/bash
# start-worker.sh

echo "========================================"
echo "🚀 Starting Laravel Queue Worker"
echo "========================================"

# Quick database check
php artisan db:monitor || exit 1

# Process jobs and exit
exec php artisan queue:work --stop-when-empty --tries=3 --max-time=50