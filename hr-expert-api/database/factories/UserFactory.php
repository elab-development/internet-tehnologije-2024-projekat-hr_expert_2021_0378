<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Role;
use App\Models\Department;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition()
    {
        // pick a unique seed so each user gets a different image
        $seed = $this->faker->uuid;

        return [
            'name'              => $this->faker->name(),
            'email'             => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password'          => bcrypt('password'),
            'remember_token'    => Str::random(10),
            'role_id'           => Role::inRandomOrder()->first()->id,
            'department_id'     => Department::inRandomOrder()->first()->id,
            'image_url'         => "https://picsum.photos/seed/{$seed}/200/200",
        ];
    }
}