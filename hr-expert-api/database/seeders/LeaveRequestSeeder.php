<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LeaveRequest;

class LeaveRequestSeeder extends Seeder
{
    public function run(): void
    {
        // "a couple" = 2
        LeaveRequest::factory()
            ->count(2)
            ->create();
    }
}