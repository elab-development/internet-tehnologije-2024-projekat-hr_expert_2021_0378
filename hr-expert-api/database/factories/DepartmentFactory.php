<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Department;

class DepartmentFactory extends Factory
{
    protected $model = Department::class;

    /**
     * A list of real department names.
     *
     * @var string[]
     */
    protected static array $departments = [
        'Human Resources',
        'Finance',
        'Engineering',
        'Marketing',
        'Sales',
        'Customer Support',
        'IT',
        'Legal',
        'Research & Development',
        'Operations',
    ];

    public function definition()
    {
        return [
            'name' => $this->faker->unique()
                                    ->randomElement(self::$departments),
        ];
    }
}