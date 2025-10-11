<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * GET /api/users
     * Return a list of all users (with role & department).
     */
    public function index(Request $request)
    {
        // Optional: you can restrict this to HR/admin:
        // if (! in_array($request->user()->role->name, ['hr_worker','administrator'])) {
        //     return response()->json(['error'=>'Forbidden'], 403);
        // }

        $users = User::with(['role','department'])->get();

        // transform to only the fields you need
        $result = $users->map(fn($u) => [
            'id'            => $u->id,
            'name'          => $u->name,
            'email'         => $u->email,
            'role_id'       => $u->role_id,
            'department_id' => $u->department_id,
            'role'          => $u->role->name,
            'department'    => $u->department->name,
            'image_url'     => $u->image_url,
        ]);

        return response()->json($result);
    }
}