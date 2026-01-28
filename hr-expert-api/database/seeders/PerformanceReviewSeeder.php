<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PerformanceReview;

class PerformanceReviewSeeder extends Seeder
{
    public function run(): void
    {
        // "a couple" = 2
        PerformanceReview::factory()
            ->count(2)
            ->create();
    }
}