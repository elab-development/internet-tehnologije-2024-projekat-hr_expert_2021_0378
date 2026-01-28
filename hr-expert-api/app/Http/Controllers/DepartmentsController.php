<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\JsonResponse;

class DepartmentsController extends Controller
{
    /**
     * GET /api/departments
     * Vraća sva odeljenja.
     */
    public function index(): JsonResponse
    {
        $departments = Department::all(['id', 'name']);
        return response()->json($departments);
    }

    /**
     * GET /api/departments/{id}
     */
    public function show($id): JsonResponse
    {
        $dept = Department::findOrFail($id, ['id','name']);
        return response()->json($dept);
    }
}