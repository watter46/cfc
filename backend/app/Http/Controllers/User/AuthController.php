<?php

declare(strict_types = 1);

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\Auth\LoginRequest;
use App\Http\Requests\User\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $user = User::create([
                'ulid' => Str::ulid()->toBase32(),
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Registration successful!',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ],
                    'token' => $token,
                    'token_type' => 'Bearer',
                ],
            ], 201);
        } catch (ValidationException $e) {
            Log::warning('Validation failed during registration', ['errors' => $e->errors()]);

            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Unexpected error during registration', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'An unexpected error occurred.',
            ], 500);
        }
    }

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $user = User::where('email', $validated['email'])->first();

            if (! $user || ! Hash::check($validated['password'], $user->password)) {
                throw new AuthenticationException('Invalid credentials.');
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Authentication successful.',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ],
                    'token' => $token,
                    'token_type' => 'Bearer',
                ],
            ]);
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

    public function logout(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (! $user) {
                return response()->json([
                    'message' => 'Already unauthenticated.',
                ], 401);
            }

            // 現在のトークンを削除
            $request->user()->currentAccessToken()->delete();

            return response()->json([
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

            if (! $user) {
                return response()->json([
                    'message' => 'User not authenticated.',
                ], 401);
            }

            return new JsonResponse([
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
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

    /**
     * ユーザーのトークン一覧を取得
     */
    public function tokens(Request $request): JsonResponse
    {
        try {
            $tokens = $request->user()->tokens()->get(['id', 'name', 'last_used_at', 'created_at']);

            return response()->json([
                'data' => $tokens,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch tokens', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'An unexpected error occurred.',
            ], 500);
        }
    }

    /**
     * 指定したトークンを削除
     */
    public function revokeToken(Request $request, int $tokenId): JsonResponse
    {
        try {
            $deleted = $request->user()->tokens()->where('id', $tokenId)->delete();

            if (! $deleted) {
                return response()->json([
                    'message' => 'Token not found.',
                ], 404);
            }

            return response()->json([
                'message' => 'Token revoked successfully.',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to revoke token', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'An unexpected error occurred.',
            ], 500);
        }
    }

    /**
     * 現在のトークン以外をすべて削除
     */
    public function revokeAllTokens(Request $request): JsonResponse
    {
        try {
            $currentTokenId = $request->user()->currentAccessToken()->id;
            $deletedCount = $request->user()->tokens()->where('id', '!=', $currentTokenId)->delete();

            return response()->json([
                'message' => "Successfully revoked {$deletedCount} tokens.",
                'revoked_count' => $deletedCount,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to revoke all tokens', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'An unexpected error occurred.',
            ], 500);
        }
    }
}
