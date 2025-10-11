<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\LeaveRequest;
use App\Models\User;

class LeaveRequestFactory extends Factory
{
    protected $model = LeaveRequest::class;

    public function definition()
    {
        $employees  = User::whereHas('role', fn($q) => $q->where('name','employee'))->pluck('id');
        $hrWorkers  = User::whereHas('role', fn($q) => $q->where('name','hr_worker'))->pluck('id');

        $start = $this->faker->dateTimeBetween('-1 month','+1 month');
        $end   = (clone $start)->modify('+'.mt_rand(1,10).' days');

        return [
            'employee_id'   => $this->faker->randomElement($employees),
            'hr_worker_id'  => $this->faker->randomElement($hrWorkers),
            'start_date'    => $start->format('Y-m-d'),
            'end_date'      => $end->format('Y-m-d'),
            'status'        => $this->faker->randomElement(['pending','approved','rejected']),
        ];
    }
}