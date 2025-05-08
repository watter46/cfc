<?php

declare(strict_types=1);

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\Auth\LoginRequest;
use App\Http\Requests\User\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\AuthManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthManager $auth,
    ) {
    }

    public function register(RegisterRequest $request)
    {
        try {
            $validated = $request->validated();

            User::create([
                'name'     => $validated['name'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            return response()->json(['message' => 'Registration successful!'], 201);
        } catch (ValidationException $e) {
            Log::warning('Validation failed during registration', ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Validation failed',
            ], 422);
        } catch (\Exception $e) {
            Log::error('Unexpected error during registration', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'An unexpected error occurred.',
            ], 500);
        }
    }

    public function login(LoginRequest $request)
    {
        try {
            $validated = $request->validated();

            if ($this->auth->guard()->attempt($validated)) {
                $request->session()->regenerate();

                return new JsonResponse([
                    'message' => 'Authenticated.',
                ]);
            }
            throw new AuthenticationException('Invalid credentials.');

        } catch (AuthenticationException $e) {
            Log::warning('Authentication failed', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Authentication failed.',
            ], 401);
        } catch (\Exception $e) {
            Log::error('Unexpected error during login', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'An unexpected error occurred.',
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            if ($this->auth->guard()->guest()) {
                return new JsonResponse([
                    'message' => 'Already unauthenticated.',
                ]);
            }

            $this->auth->guard()->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return new JsonResponse([
                'message' => 'Successfully logged out.',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to logout', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to logout.',
            ], 500);
        }
    }

    public function me(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'message' => 'User not authenticated.',
                ], 401);
            }

            return new JsonResponse([
                'data' => [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch user data', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'An unexpected error occurred.',
            ], 500);
        }
    }
}
