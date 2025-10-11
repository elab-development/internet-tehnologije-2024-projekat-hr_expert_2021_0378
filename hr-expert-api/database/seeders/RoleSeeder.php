<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = ['employee', 'hr_worker', 'administrator'];

        foreach ($roles as $roleName) {
            Role::factory()->create([
                'name' => $roleName,
            ]);
        }
    }
}