<?php

declare(strict_types = 1);

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * ユーザー登録のテスト
     */
    public function test_ユーザーが登録できる(): void
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'user' => [
                        'id',
                        'name',
                        'email',
                    ],
                    'token',
                    'token_type',
                ],
            ])
            ->assertJson([
                'message' => 'Registration successful!',
                'data' => [
                    'user' => [
                        'name' => 'Test User',
                        'email' => 'test@example.com',
                    ],
                    'token_type' => 'Bearer',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // トークンがDBに保存されているか確認
        $user = User::where('email', 'test@example.com')->first();
        $this->assertCount(1, $user->tokens);
    }

    /**
     * ユーザーログインのテスト
     */
    public function test_ユーザーがログインできる(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $loginData = [
            'email' => 'test@example.com',
            'password' => 'password123',
        ];

        $response = $this->postJson('/api/auth/login', $loginData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'user' => [
                        'id',
                        'name',
                        'email',
                    ],
                    'token',
                    'token_type',
                ],
            ])
            ->assertJson([
                'message' => 'Authentication successful.',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ],
                    'token_type' => 'Bearer',
                ],
            ]);

        // トークンがDBに保存されているか確認
        $this->assertCount(1, $user->fresh()->tokens);
    }

    /**
     * 無効な認証情報でのログインのテスト
     */
    public function test_無効な認証情報でログインできない(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $loginData = [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ];

        $response = $this->postJson('/api/auth/login', $loginData);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Authentication failed.',
            ]);
    }

    /**
     * 認証済みユーザー情報取得のテスト
     */
    public function test_認証済みユーザーがプロフィールを取得できる(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'email',
                ],
            ])
            ->assertJson([
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
            ]);
    }

    /**
     * 未認証ユーザーがプロフィール取得できないテスト
     */
    public function test_未認証ユーザーがプロフィールを取得できない(): void
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401);
    }

    /**
     * ユーザーログアウトのテスト
     */
    public function test_ユーザーがログアウトできる(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test_token');

        $response = $this->withHeader('Authorization', 'Bearer ' . $token->plainTextToken)
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Successfully logged out.',
            ]);

        // トークンが削除されているか確認
        $this->assertCount(0, $user->fresh()->tokens);
    }

    /**
     * トークン一覧取得のテスト
     */
    public function test_ユーザーがトークン一覧を取得できる(): void
    {
        $user = User::factory()->create();
        $user->createToken('token1');
        $user->createToken('token2');

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/auth/tokens');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'last_used_at',
                        'created_at',
                    ],
                ],
            ]);

        $this->assertCount(2, $response->json('data'));
    }

    /**
     * 特定トークン削除のテスト
     */
    public function test_ユーザーが特定のトークンを削除できる(): void
    {
        $user = User::factory()->create();
        $token1 = $user->createToken('token1');
        $token2 = $user->createToken('token2');

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/auth/tokens/{$token1->accessToken->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Token revoked successfully.',
            ]);

        // token1が削除され、token2が残っているか確認
        $this->assertCount(1, $user->fresh()->tokens);
        $this->assertEquals($token2->accessToken->id, $user->fresh()->tokens->first()->id);
    }

    /**
     * 全トークン削除（現在のトークン以外）のテスト
     */
    public function test_ユーザーが他の全トークンを削除できる(): void
    {
        $user = User::factory()->create();
        $user->createToken('token1');
        $user->createToken('token2');
        $currentToken = $user->createToken('current_token');

        $response = $this->withHeader('Authorization', 'Bearer ' . $currentToken->plainTextToken)
            ->postJson('/api/auth/tokens/revoke-all');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'revoked_count',
            ])
            ->assertJson([
                'revoked_count' => 2,
            ]);

        // 現在のトークンのみが残っているか確認
        $this->assertCount(1, $user->fresh()->tokens);
        $this->assertEquals($currentToken->accessToken->id, $user->fresh()->tokens->first()->id);
    }

    /**
     * バリデーションエラーのテスト（登録）
     */
    public function test_登録時のバリデーションエラー(): void
    {
        $invalidData = [
            'name' => '',
            'email' => 'invalid-email',
            'password' => '123', // 短すぎる
        ];

        $response = $this->postJson('/api/auth/register', $invalidData);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'message',
                'errors',
            ]);
    }

    /**
     * バリデーションエラーのテスト（ログイン）
     */
    public function test_ログイン時のバリデーションエラー(): void
    {
        $invalidData = [
            'email' => 'invalid-email',
            'password' => '',
        ];

        $response = $this->postJson('/api/auth/login', $invalidData);

        $response->assertStatus(422);
    }
}
