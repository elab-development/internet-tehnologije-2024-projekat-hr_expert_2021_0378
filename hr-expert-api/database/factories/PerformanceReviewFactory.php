<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\PerformanceReview;
use App\Models\User;

class PerformanceReviewFactory extends Factory
{
    protected $model = PerformanceReview::class;

    public function definition()
    {
        $employees = User::whereHas('role', fn($q) => $q->where('name','employee'))->pluck('id');
        $reviewers = User::whereHas('role', fn($q) => $q->whereIn('name',['administrator','hr_worker']))->pluck('id');

        return [
            'employee_id' => $this->faker->randomElement($employees),
            'reviewer_id' => $this->faker->randomElement($reviewers),
            'score'       => $this->faker->numberBetween(1,5),
            'feedback'    => $this->faker->paragraph(),
        ];
    }
}