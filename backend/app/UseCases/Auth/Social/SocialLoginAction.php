<?php

declare(strict_types=1);

namespace App\UseCases\Auth\Social;

use App\Http\Controllers\Auth\SocialProviderType;
use App\Models\User;
use App\Traits\Loggable;
use App\UseCases\Auth\Social\Services\SocialUserService;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Contracts\User as ContractsUser;

/**
 * ソーシャルログイン処理のユースケースクラス
 * 
 * ソーシャルログインでのユーザー検索・作成・更新処理を担当します。
 * ビジネスロジックはServiceに委譲し、データの調整・連携を行います。
 */
final readonly class SocialLoginAction
{
    use Loggable;

    public function __construct(
        private SocialUserService $socialUserService
    ) {}

    /**
     * ソーシャルログイン処理を実行
     * 
     * @param ContractsUser $socialiteUser Socialiteから取得したユーザー情報
     * @param SocialProviderType $provider プロバイダータイプ（google|x）
     * @return array{user: User, token: string, is_new_user: bool} 処理結果
     */
    public function execute(ContractsUser $socialiteUser, SocialProviderType $provider): array
    {
        $this->logStart([
            'provider' => $provider->value,
            'social_user_id' => $socialiteUser->id,
            'email' => $socialiteUser->email
        ]);

        // 1. 既存ユーザーをプロバイダーIDで検索
        $user = $this->socialUserService->findUserByProvider($socialiteUser, $provider);
        $isNewUser = false;

        if ($user) {
            // 2. 既存ユーザーの情報更新
            $this->socialUserService->updateUserFromSocialite($user, $socialiteUser);
        } else {
            // 3. メールアドレスでの既存ユーザー検索とプロバイダー連携
            $user = $this->handleUserLinkingOrCreation($socialiteUser, $provider);
            $isNewUser = $user->wasRecentlyCreated;
        }

        // 4. Sanctumトークンの生成
        $token = $user->createToken('social-auth-token')->plainTextToken;

        $this->logComplete([
            'user_id' => $user->id,
            'provider' => $provider->value,
            'is_new_user' => $isNewUser
        ]);

        return [
            'user' => $user,
            'token' => $token,
            'is_new_user' => $isNewUser
        ];
    }

    /**
     * メールアドレスでの既存ユーザー検索とプロバイダー連携、または新規作成
     * 
     * @param ContractsUser $socialiteUser Socialiteユーザー
     * @param SocialProviderType $provider プロバイダータイプ
     * @return User 連携済みまたは新規作成されたユーザー
     */
    private function handleUserLinkingOrCreation(ContractsUser $socialiteUser, SocialProviderType $provider): User
    {
        // メールアドレスで既存ユーザーを検索
        $existingUser = $this->socialUserService->findUserByEmail($socialiteUser->email);
        
        if ($existingUser) {
            // 既存ユーザーにソーシャルプロバイダー情報を連携
            return $this->socialUserService->linkProviderToUser($existingUser, $socialiteUser, $provider);
        }

        // 新規ユーザーを作成
        return $this->socialUserService->createNewSocialUser($socialiteUser, $provider);
    }
}
