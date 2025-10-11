<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        // this will pull from your DepartmentFactory's real-names array
        Department::factory()
            ->count(10)
            ->create();
    }
}