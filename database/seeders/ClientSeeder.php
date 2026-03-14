<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Client;
use App\Models\Service;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
          // Create 20 clients
        Client::factory(20)->create()->each(function ($client) {
            // Assign 1-3 random services to each client
            $services = Service::inRandomOrder()->take(rand(1, 3))->get();
            
            foreach ($services as $service) {
                $client->services()->attach($service->id, [
                    'status' => fake()->randomElement(['Pending', 'In Progress', 'Completed']),
                ]);
            }
        });
    }
}
