<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Http\Controllers\Auth\SocialProviderType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

/**
 * ソーシャルログイン機能のFeature Test
 * 
 * API エンドポイントの統合テストを実装し、
 * 実際のHTTPリクエスト・レスポンスの動作を検証します。
 */
class SocialLoginTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /**
     * @test
     * Googleログインのリダイレクトが正常に動作することを確認
     */
    public function ソーシャルログイン_Googleリダイレクト_正常動作(): void
    {
        // Socialiteのモック作成
        $mockDriver = Mockery::mock();
        $mockDriver->shouldReceive('redirect')
            ->once()
            ->andReturn(redirect('https://accounts.google.com/oauth/authorize'));

        Socialite::shouldReceive('driver')
            ->with('google')
            ->once()
            ->andReturn($mockDriver);

        // リクエスト実行
        $response = $this->get('/api/auth/social/google/redirect');

        // レスポンス検証
        $response->assertStatus(302);
    }

    /**
     * @test
     * Xログインのリダイレクトが正常に動作することを確認
     */
    public function ソーシャルログイン_Xリダイレクト_正常動作(): void
    {
        // Socialiteのモック作成
        $mockDriver = Mockery::mock();
        $mockDriver->shouldReceive('redirect')
            ->once()
            ->andReturn(redirect('https://api.twitter.com/oauth/authorize'));

        Socialite::shouldReceive('driver')
            ->with('x')
            ->once()
            ->andReturn($mockDriver);

        // リクエスト実行
        $response = $this->get('/api/auth/social/x/redirect');

        // レスポンス検証
        $response->assertStatus(302);
    }

    /**
     * @test
     * 新規ユーザーのGoogleログインコールバックが正常に動作することを確認
     */
    public function ソーシャルログイン_Google新規ユーザー_正常作成(): void
    {
        // Socialiteユーザーのモック作成
        $socialiteUser = $this->createMockSocialiteUser([
            'id' => 'google123',
            'name' => 'テストユーザー',
            'email' => 'test@example.com'
        ]);

        $this->mockSocialiteCallback('google', $socialiteUser);

        // リクエスト実行
        $response = $this->get('/api/auth/social/google/callback');

        // レスポンス検証
        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'user' => [
                    'ulid',
                    'name',
                    'email'
                ],
                'token'
            ])
            ->assertJson([
                'message' => 'ソーシャルログインが成功しました',
                'user' => [
                    'name' => 'テストユーザー',
                    'email' => 'test@example.com'
                ]
            ]);

        // データベース検証
        $this->assertDatabaseHas('users', [
            'name' => 'テストユーザー',
            'email' => 'test@example.com',
            'provider' => 'google',
            'provider_id' => 'google123'
        ]);
    }

    /**
     * @test
     * 既存ユーザーのソーシャルログインが正常に動作することを確認
     */
    public function ソーシャルログイン_既存ユーザー_正常ログイン(): void
    {
        // 既存ユーザーを作成
        $existingUser = User::factory()->create([
            'name' => '既存ユーザー',
            'email' => 'existing@example.com',
            'provider' => 'google',
            'provider_id' => 'google456'
        ]);

        // Socialiteユーザーのモック作成
        $socialiteUser = $this->createMockSocialiteUser([
            'id' => 'google456',
            'name' => '更新された名前',
            'email' => 'existing@example.com'
        ]);

        $this->mockSocialiteCallback('google', $socialiteUser);

        // リクエスト実行
        $response = $this->get('/api/auth/social/google/callback');

        // レスポンス検証
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'ソーシャルログインが成功しました',
                'user' => [
                    'name' => '更新された名前',
                    'email' => 'existing@example.com'
                ]
            ]);

        // ユーザー情報が更新されていることを確認
        $existingUser->refresh();
        $this->assertEquals('更新された名前', $existingUser->name);
    }

    /**
     * @test
     * メールアドレスが同じ既存ユーザーとの連携が正常に動作することを確認
     */
    public function ソーシャルログイン_メール連携_正常動作(): void
    {
        // 通常登録の既存ユーザーを作成（ソーシャル情報なし）
        $existingUser = User::factory()->create([
            'email' => 'same@example.com',
            'provider' => null,
            'provider_id' => null
        ]);

        // Socialiteユーザーのモック作成
        $socialiteUser = $this->createMockSocialiteUser([
            'id' => 'google789',
            'name' => 'ソーシャルユーザー',
            'email' => 'same@example.com'
        ]);

        $this->mockSocialiteCallback('google', $socialiteUser);

        // リクエスト実行
        $response = $this->get('/api/auth/social/google/callback');

        // レスポンス検証
        $response->assertStatus(200);

        // 既存ユーザーにプロバイダー情報が追加されていることを確認
        $existingUser->refresh();
        $this->assertEquals('google', $existingUser->provider);
        $this->assertEquals('google789', $existingUser->provider_id);
    }

    /**
     * @test
     * サポートされていないプロバイダーでエラーが返されることを確認
     */
    public function ソーシャルログイン_未サポートプロバイダー_エラー(): void
    {
        // リクエスト実行
        $response = $this->get('/api/auth/social/facebook/redirect');

        // 404エラーが返されることを確認
        $response->assertStatus(404);
    }

    /**
     * @test
     * Socialiteでエラーが発生した場合の処理を確認
     */
    public function ソーシャルログイン_Socialite例外_エラーハンドリング(): void
    {
        // Socialiteのモック作成（例外を投げる）
        $mockDriver = Mockery::mock();
        $mockDriver->shouldReceive('user')
            ->once()
            ->andThrow(new \Exception('OAuth認証に失敗しました'));

        Socialite::shouldReceive('driver')
            ->with('google')
            ->once()
            ->andReturn($mockDriver);

        // リクエスト実行
        $response = $this->get('/api/auth/social/google/callback');

        // エラーレスポンス検証
        $response->assertStatus(400)
            ->assertJson([
                'message' => 'ソーシャルログインに失敗しました',
                'error' => 'ログインがキャンセルされたか、認証に失敗しました'
            ]);
    }

    /**
     * Socialiteユーザーのモックを作成
     */
    private function createMockSocialiteUser(array $userData): SocialiteUser
    {
        $socialiteUser = Mockery::mock(SocialiteUser::class);
        $socialiteUser->id = $userData['id'];
        $socialiteUser->name = $userData['name'] ?? null;
        $socialiteUser->email = $userData['email'] ?? null;

        return $socialiteUser;
    }

    /**
     * Socialiteコールバックのモック設定
     */
    private function mockSocialiteCallback(string $provider, SocialiteUser $socialiteUser): void
    {
        $mockDriver = Mockery::mock();
        $mockDriver->shouldReceive('user')
            ->once()
            ->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')
            ->with($provider)
            ->once()
            ->andReturn($mockDriver);
    }
}
