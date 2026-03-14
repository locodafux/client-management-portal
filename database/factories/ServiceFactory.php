<?php

namespace Database\Factories;

use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;


/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Service>
 */
class ServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
         $services = [
            'Web Development',
            'Mobile App Development',
            'UI/UX Design',
            'Digital Marketing',
            'SEO Optimization',
            'Content Writing',
            'Social Media Management',
            'IT Consulting',
            'Cloud Services',
            'Data Analytics',
            'Cyber Security',
            'Technical Support'
        ];

        return [
            'name' => $this->faker->unique()->randomElement($services),
            'description' => $this->faker->paragraph(),
            'is_active' => $this->faker->boolean(80),
        ];
    }
}
