<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\JsonResponse;

class RolesController extends Controller
{
    /**
     * GET /api/roles
     * Vraća sve uloge.
     */
    public function index(): JsonResponse
    {
        $roles = Role::all(['id', 'name']);
        return response()->json($roles);
    }

    /**
     * GET /api/roles/{id}
     */
    public function show($id): JsonResponse
    {
        $role = Role::findOrFail($id, ['id','name']);
        return response()->json($role);
    }
}