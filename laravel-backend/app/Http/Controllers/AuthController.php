<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Firebase\JWT\JWT;

class AuthController extends Controller
{
    private function generateJwt(User $user): string
    {
        $secret = env('JWT_SECRET', 'realtech-secret-key-12345');
        $payload = [
            'iss' => env('APP_URL', 'http://localhost'),
            'sub' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'iat' => time(),
            'exp' => time() + (60 * 60 * 24 * 7), // 7 days
        ];
        return JWT::encode($payload, $secret, 'HS256');
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:100',
            'email'    => 'required|string|email|max:150|unique:users',
            'password' => 'required|string|min:6',
            'phone'    => 'nullable|string|max:30',
            'address'  => 'nullable|string',
        ]);

        $user = User::create([
            'name'       => $validated['name'],
            'full_name'  => $validated['name'],
            'email'      => $validated['email'],
            'password'   => Hash::make($validated['password']),
            'phone'      => $validated['phone'] ?? null,
            'address'    => $validated['address'] ?? null,
            'role'       => 'customer',
            'is_active'  => true,
        ]);

        $token = $this->generateJwt($user);

        return $this->success([
            'token' => $token,
            'user'  => $user,
        ], 'Registration successful', 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return $this->error('Invalid credentials', 401);
        }

        if (!$user->is_active) {
            return $this->error('Your account is currently disabled', 403);
        }

        $token = $this->generateJwt($user);

        return $this->success([
            'token' => $token,
            'user'  => $user,
        ], 'Login successful');
    }

    public function adminLogin(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return $this->error('Invalid credentials', 401);
        }

        if (!$user->isAdmin() && !$user->isStaff()) {
            return $this->error('Unauthorized: Admin access required', 403);
        }

        if (!$user->is_active) {
            return $this->error('Your account is currently disabled', 403);
        }

        $token = $this->generateJwt($user);

        return $this->success([
            'token' => $token,
            'user'  => $user,
            'roles' => [$user->role],
        ], 'Admin login successful');
    }

    public function me(Request $request)
    {
        $user = $request->user() ?? $request->get('auth_user');
        return $this->success($user);
    }

    public function logout()
    {
        return $this->success(null, 'Logged out successfully');
    }
}
