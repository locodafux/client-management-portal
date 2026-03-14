echo "🚀 Running Render build script..."

# Install dependencies
composer install --no-dev --optimize-autoloader
npm install
npm run build

# Cache Laravel config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations and seeders
echo "📦 Running database migrations..."
php artisan migrate --force

echo "🌱 Running database seeders..."
php artisan db:seed --force

echo "✅ Build completed successfully!"