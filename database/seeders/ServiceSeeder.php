<?php
// database/seeders/ServiceSeeder.php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        if (Service::count() === 0) {
            $services = [
                ['name' => 'Web Development', 'description' => 'Custom website development', 'is_active' => true],
                ['name' => 'Mobile App Development', 'description' => 'iOS and Android apps', 'is_active' => true],
                ['name' => 'UI/UX Design', 'description' => 'User interface and experience design', 'is_active' => true],
                ['name' => 'Digital Marketing', 'description' => 'Online marketing campaigns', 'is_active' => true],
                ['name' => 'SEO Optimization', 'description' => 'Search engine optimization', 'is_active' => true],
                ['name' => 'Cloud Services', 'description' => 'Cloud hosting and management', 'is_active' => false],
            ];

            foreach ($services as $service) {
                Service::create($service);
            }
            
            $this->command->info('Services seeded successfully!');
        } else {
            $this->command->info('Services already exist, skipping seeder.');
        }
    }
}