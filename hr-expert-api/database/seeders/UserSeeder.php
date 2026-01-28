<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use App\Models\User;
use App\Models\Role;
use App\Models\Department;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $employeeRole   = Role::firstWhere('name', 'employee');
        $hrWorkerRole   = Role::firstWhere('name', 'hr_worker');
        $adminRole      = Role::firstWhere('name', 'administrator');

        $hrDepartment   = Department::firstWhere('name', 'Human Resources');
        $itDepartment   = Department::firstWhere('name', 'IT');
        $otherDeptIds   = Department::where('name', '!=', 'Human Resources')
                                     ->pluck('id')
                                     ->toArray();

        // 10 employees in non-HR departments
        User::factory()
            ->count(10)
            ->make()
            ->each(function ($user) use ($employeeRole, $otherDeptIds) {
                $user->role_id       = $employeeRole->id;
                $user->department_id = Arr::random($otherDeptIds);
                $user->save();
            });

        // 10 HR workers in the HR department
        User::factory()
            ->count(10)
            ->make()
            ->each(function ($user) use ($hrWorkerRole, $hrDepartment) {
                $user->role_id       = $hrWorkerRole->id;
                $user->department_id = $hrDepartment->id;
                $user->save();
            });

        // 1 administrator in IT
        User::factory()->create([
            'name'           => 'admin',
            'email'          => 'admin@admin.com',
            'password'       => bcrypt('admin'),
            'role_id'       => $adminRole->id,
            'department_id' => $itDepartment->id,
            "image_url"=> "https://t4.ftcdn.net/jpg/04/22/23/99/360_F_422239917_nRLYm6guQu9g6JMhJseXUhGSMgtBJ44x.jpg"
        ]);
    }
}