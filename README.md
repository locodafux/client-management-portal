# PART 1: PROJECT OVERVIEW

A simple Client Management Portal where internal users can manage clients and the services assigned to them. Built with Laravel 11, Inertia.js, React, and Tailwind CSS.

Tech Stack:
- Backend: Laravel 11
- Frontend: React with Inertia.js
- Styling: Tailwind CSS
- Database: PostgreSQL (Production) / MySQL (Local)
- Queue: Database driver
- File Processing: Laravel Excel (Maatwebsite)
- Authentication: Laravel Breeze

# PART 2: LIVE URL & REPOSITORY

Live Application:
https://client-management-portal.onrender.com

GitHub Repository:
https://github.com/locodafux/client-management-portal

# PART 3: LOCAL SETUP INSTRUCTIONS

Prerequisites:
- PHP 8.2 or higher
- Composer
- Node.js & npm
- MySQL
- Git

Installation Steps:

Step 1: Clone the repository
git clone https://github.com/locodafux/client-management-portal.git
cd client-management-portal

Step 2: Install PHP dependencies
composer install

Step 3: Install JavaScript dependencies
npm install

Step 4: Environment setup
cp .env.example .env
php artisan key:generate

Step 5: Configure your database in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=client_management
DB_USERNAME=root
DB_PASSWORD=

Step 6: Set queue connection to database in .env
QUEUE_CONNECTION=database

Step 7: Run migrations and seeders
php artisan migrate
php artisan db:seed

Step 8: Create queue table
php artisan queue:table
php artisan migrate

Step 9: Build frontend assets
npm run build

Step 10: Start the development servers

Terminal 1 (Laravel):
php artisan serve

Terminal 2 (Vite):
npm run dev

Terminal 3 (Queue Worker):
php artisan queue:work

# PART 4: TEST CREDENTIALS

Role    | Email                 | Password
--------|-----------------------|-----------
Admin   | admin@example.com     | password
Manager | manager@example.com   | password
Staff   | staff@example.com     | password

# PART 5: QUEUE WORKER SETUP

Local Development:

# Set queue connection in .env
QUEUE_CONNECTION=database

# Create jobs table
php artisan queue:table
php artisan migrate

# Start the worker
php artisan queue:work

Production Setup (Render):

The application uses database queue driver and runs the worker in the same container:

.env configuration:
QUEUE_CONNECTION=database

In start.sh - runs queue worker in background:
php artisan queue:work --tries=3 --daemon &
php artisan serve --host=0.0.0.0 --port=${PORT:-10000}

# PART 6: DockerFile

# Stage 1 - Build Frontend (Vite)
FROM node:18 AS frontend
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm install

# Copy the rest of the app and build
COPY . .
RUN npm run build

# Stage 2 - Backend (PHP)
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && docker-php-ext-install pdo_pgsql pgsql

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Create necessary directories
RUN mkdir -p storage/app/imports storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Copy application files
COPY . .

# Copy built frontend from Stage 1
COPY --from=frontend /app/public/build /var/www/html/public/build

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --ignore-platform-reqs

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/public/build || true
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/public/build || true

# Create storage link
RUN php artisan storage:link || true

# Copy startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE ${PORT:-10000}

CMD ["/start.sh"]

# PART: 7

#!/bin/bash
# start.sh

echo "========================================"
echo "Starting Laravel application with QUEUE WORKER"
echo "========================================"

export HTTPS=true
export REQUEST_SCHEME=https

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
        echo "Database connected successfully!"
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

# PART 8: ENVIRONMENT VARIABLES

APP_ENV=production
APP_DEBUG=false
APP_URL=https://client-management-portal.onrender.com
QUEUE_CONNECTION=database
DB_CONNECTION=pgsql
DB_HOST=your-database-host
DB_PORT=5432
DB_DATABASE=your-database-name
DB_USERNAME=client_user
DB_PASSWORD=your-password

# PART 9: PART 9: MODULES IMPLEMENTED

✅ Module 1 — Authentication & Roles
- Laravel Breeze for login/logout
- Three seeded users (Admin, Manager, Staff)
- Role column on users table
- Role middleware protecting routes (403 for unauthorized)

✅ Module 2 — User Management (Admin only)
- List users with name, email, role
- Create and edit users
- Active/inactive toggle instead of delete

✅ Module 3 — Services CRUD
- Full CRUD for services (name, description, status)
- Active/inactive toggle
- Admin and Manager only access

✅ Module 4 — Client Management
- Full CRUD for clients with all fields
- Service assignment with status per assignment
- Staff user assignment
- Searchable list with pagination
- Role-based permissions

✅ Module 5 — Client Import via CSV/Excel
- Import button on client list
- Downloadable template
- Laravel Excel integration
- Validation and duplicate skipping
- Import summary

✅ Module 6 — Background Import + Queue
- Asynchronous imports via queue
- Imports table tracking status
- Auto-polling for status updates
- Status badges with visual distinction
- Real-time progress tracking

✅ Module 7 — Deployment
- Live public URL on Render
- PostgreSQL database
- Queue worker running in same container
- Fully functional application

# PART 10: AI USAGE LOG

Tools Used:
- DeepSeek: Primary AI assistant for architectural decisions and complex problem-solving
- ChatGPT: Secondary AI tool for code optimization and alternative solutions

Where AI Was Applied:

1. Strategic Architecture Planning
   - Database schema design with proper relationships
   - Role-based permission system
   - Queue-based import system design

2. Code Generation
   - React components for all modules
   - CRUD operations boilerplate
   - Job and import classes

3. Problem-Solving & Debugging
   - File permission issues in Docker
   - Path resolution for uploaded files
   - Queue worker configuration
   - Mixed content (HTTPS) fixes
   - ZipArchive extension installation

4. Optimization
   - Database query optimization
   - Component reusability
   - Error handling improvements

Bugs/Challenges Encountered & Resolved:

| Challenge | Solution |
|-----------|----------|
| File not found in queue jobs | Fixed path resolution to use storage_path('app/private/imports/') |
| Mixed content errors | Added URL::forceScheme('https') and CSP meta tag |
| ZipArchive not found | Added zip extension to docker-php-ext-install |
| Imports stuck in Processing | Added failed() method and better error handling |
| Permission denied for worker script | Added chmod +x in Dockerfile |
| Database connection issues | Added wait loop in start.sh |

Key Takeaways:
AI tools accelerated development while maintaining code quality, serving as collaborative partners in architecture decisions, code review, and problem-solving.

# PART 11: LICENSE

This project is part of a skills test assessment.

