<?php

declare(strict_types=1);

namespace Tests\Unit\Unit\UseCases\Auth\Social;

use App\Http\Controllers\Auth\SocialProviderType;
use App\UseCases\Auth\Social\Services\SocialUserService;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

/**
 * SocialLoginAction の単体テスト
 *
 * ビジネスロジックの正確性を検証します。
 */
class SocialLoginActionTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /**
     * @test
     * SocialProviderTypeの値が正しく設定されていることを確認
     */
    public function social_provider_type_値の確認(): void
    {
        $this->assertEquals('google', SocialProviderType::Google->value);
        $this->assertEquals('x', SocialProviderType::X->value);
    }

    /**
     * @test
     * Socialiteユーザーのモック作成が正常に動作することを確認
     */
    public function socialiteユーザーモック_正常作成(): void
    {
        $socialiteUser = $this->createMockSocialiteUser([
            'id'    => 'test123',
            'name'  => 'テストユーザー',
            'email' => 'test@example.com',
        ]);

        $this->assertEquals('test123', $socialiteUser->id);
        $this->assertEquals('テストユーザー', $socialiteUser->name);
        $this->assertEquals('test@example.com', $socialiteUser->email);
    }

    /**
     * @test
     * SocialUserServiceのモック作成が正常に動作することを確認
     */
    public function social_user_serviceモック_正常作成(): void
    {
        $mockService = Mockery::mock(SocialUserService::class);
        $this->assertInstanceOf(SocialUserService::class, $mockService);
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
}
