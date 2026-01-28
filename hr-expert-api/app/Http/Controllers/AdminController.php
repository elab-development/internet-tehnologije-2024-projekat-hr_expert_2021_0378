<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    /**
     * GET /admin/metrics
     * Broj zaposlenih po odeljenjima.
     */
    public function getMetrics()
    {
        $user = Auth::user();
        if ($user->role->name !== 'administrator') {
            return response()->json(['error' => 'Nemate dozvolu.'], 403);
        }

        $metrics = Department::withCount([
            // samo uloge "employee"
            'users as employee_count' => function($q) {
                $q->whereHas('role', fn($q2) => 
                    $q2->where('name', 'employee')
                );
            }
        ])->get()->map(fn($dept) => [
            'department_id'   => $dept->id,
            'department_name' => $dept->name,
            'employee_count'  => $dept->employee_count,
        ]);

        return response()->json($metrics);
    }

    /**
     * GET /admin/users
     * Vraća sve korisnike.
     */
    public function getUsers()
    {
        $user = Auth::user();
        if ($user->role->name !== 'administrator') {
            return response()->json(['error' => 'Nemate dozvolu.'], 403);
        }

        $users = User::all();
        return response()->json($users);
    }

    /**
     * DELETE /admin/users/{id}
     * Briše korisnika po ID-ju.
     */
    public function removeUser($id)
    {
        $user = Auth::user();
        if ($user->role->name !== 'administrator') {
            return response()->json(['error' => 'Nemate dozvolu.'], 403);
        }

        $target = User::findOrFail($id);
        $target->delete();

        return response()->json(['message' => 'Korisnik obrisan.']);
    }
}