<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Registracija novog korisnika.
     */
    public function register(Request $request)
    {
        // Validacija unosa
        $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email',
            'password'      => 'required|string|min:6',
            'role_id'       => 'required|exists:roles,id',
            'department_id' => 'required|exists:departments,id',
            'image_url'     => 'nullable|url',
        ]);

        // Kreiranje korisnika
        $user = User::create([
            'name'          => $request->name,
            'email'         => $request->email,
            'password'      => Hash::make($request->password),
            'role_id'       => $request->role_id,
            'department_id' => $request->department_id,
            'image_url'     => $request->image_url,
        ]);

        // Generisanje API tokena
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Korisnik uspešno registrovan.',
            'user'    => $user,
            'token'   => $token,
        ], 201);
    }

    /**
     * Logovanje korisnika.
     */
    public function login(Request $request)
    {
        // Validacija unosa
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        // Provera kredencijala
        if (! Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Neispravni podaci za prijavu.'
            ], 401);
        }

        /** $user */
        $user = Auth::user();

        // Generisanje/obnavljanje tokena
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Uspešno ste se prijavili.',
            'user'    => [
                'id'            => $user->id,
                'name'          => $user->name,
                'email'         => $user->email,
                'role_id'       => $user->role_id,
                'department_id' => $user->department_id,
                'image_url'     => $user->image_url,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Izlogovanje korisnika.
     */
    public function logout(Request $request)
    {
        // Brisanje trenutnog tokena
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Uspešno ste se odjavili.',
        ]);
    }
}