<?php

declare(strict_types=1);

namespace App\UseCases\Auth\Social\Services;

use App\Http\Controllers\Auth\RoleType;
use App\Http\Controllers\Auth\SocialProviderType;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Contracts\User as ContractsUser;

/**
 * ソーシャルユーザー管理サービス
 * 
 * ソーシャルログインにおけるユーザー情報の管理・操作を担当します。
 * 検索、作成、更新、プロバイダー連携などのビジネスロジックを実装します。
 */
final readonly class SocialUserService
{
    /**
     * プロバイダーIDで既存ユーザーを検索
     * 
     * @param ContractsUser $socialiteUser Socialiteユーザー
     * @param SocialProviderType $provider プロバイダータイプ
     * @return User|null 見つかったユーザーまたはnull
     */
    public function findUserByProvider(ContractsUser $socialiteUser, SocialProviderType $provider): ?User
    {
        return User::where('provider', $provider->value)
            ->where('provider_id', $socialiteUser->id)
            ->first();
    }

    /**
     * メールアドレスで既存ユーザーを検索
     * 
     * @param string|null $email メールアドレス
     * @return User|null 見つかったユーザーまたはnull
     */
    public function findUserByEmail(?string $email): ?User
    {
        if (!$email) {
            return null;
        }

        return User::where('email', $email)->first();
    }

    /**
     * 既存ユーザーの情報を更新
     * 
     * ソーシャルプロバイダー側でユーザー情報が変更されている可能性があるため、
     * 名前やメールアドレスを最新情報に更新します。
     * 
     * @param User $user 更新対象のユーザー
     * @param ContractsUser $socialiteUser Socialiteユーザー情報
     * @return array<string> 更新されたフィールド名の配列
     */
    public function updateUserFromSocialite(User $user, ContractsUser $socialiteUser): array
    {
        $updateData = [];

        // 名前の更新（Socialiteから取得できて、現在の値と異なる場合のみ）
        if ($socialiteUser->name && $socialiteUser->name !== $user->name) {
            $updateData['name'] = $socialiteUser->name;
        }

        // メールアドレスの更新（Socialiteから取得できて、現在の値と異なる場合のみ）
        if ($socialiteUser->email && $socialiteUser->email !== $user->email) {
            $updateData['email'] = $socialiteUser->email;
        }

        if (!empty($updateData)) {
            $user->update($updateData);
            
            Log::info('既存ユーザー情報を更新しました', [
                'class' => class_basename(static::class),
                'user_id' => $user->id,
                'updated_fields' => array_keys($updateData)
            ]);
        }

        return array_keys($updateData);
    }

    /**
     * 既存ユーザーにソーシャルプロバイダー情報を連携
     * 
     * @param User $existingUser 既存ユーザー
     * @param ContractsUser $socialiteUser Socialiteユーザー
     * @param SocialProviderType $provider プロバイダータイプ
     * @return User 更新されたユーザー
     */
    public function linkProviderToUser(User $existingUser, ContractsUser $socialiteUser, SocialProviderType $provider): User
    {
        $existingUser->update([
            'provider' => $provider->value,
            'provider_id' => $socialiteUser->id,
        ]);

        Log::info('既存ユーザーにソーシャルプロバイダーを連携しました', [
            'class' => class_basename(static::class),
            'user_id' => $existingUser->id,
            'provider' => $provider->value
        ]);

        return $existingUser;
    }

    /**
     * 新規ソーシャルユーザーを作成
     * 
     * @param ContractsUser $socialiteUser Socialiteユーザー
     * @param SocialProviderType $provider プロバイダータイプ
     * @return User 作成されたユーザー
     */
    public function createNewSocialUser(ContractsUser $socialiteUser, SocialProviderType $provider): User
    {
        $userData = $this->buildUserDataFromSocialite($socialiteUser, $provider);
        $user = User::create($userData);

        Log::info('新規ソーシャルユーザーを作成しました', [
            'class' => class_basename(static::class),
            'user_id' => $user->id,
            'provider' => $provider->value,
            'has_email' => !empty($socialiteUser->email)
        ]);

        return $user;
    }

    /**
     * Socialiteユーザー情報からユーザーデータを構築
     * 
     * @param ContractsUser $socialiteUser Socialiteユーザー
     * @param SocialProviderType $provider プロバイダータイプ
     * @return array<string, mixed> ユーザー作成用データ
     */
    private function buildUserDataFromSocialite(ContractsUser $socialiteUser, SocialProviderType $provider): array
    {
        return [
            'ulid' => (string) Str::ulid(),
            'name' => $this->sanitizeName($socialiteUser->name),
            'email' => $socialiteUser->email,
            'provider' => $provider->value,
            'provider_id' => $socialiteUser->id,
            'role' => RoleType::User->value,
            'password' => '', // ソーシャルログインはパスワード不要
        ];
    }

    /**
     * ユーザー名をサニタイズ
     * 
     * @param string|null $name 元のユーザー名
     * @return string サニタイズされたユーザー名
     */
    private function sanitizeName(?string $name): string
    {
        if (!$name || trim($name) === '') {
            return 'ソーシャルユーザー';
        }

        // 基本的なサニタイズ（HTMLタグ除去、最大長制限）
        $sanitized = strip_tags(trim($name));
        
        return mb_substr($sanitized, 0, 255);
    }

    /**
     * ユーザーがソーシャルプロバイダーと連携済みかを判定
     * 
     * @param User $user ユーザー
     * @param SocialProviderType $provider プロバイダータイプ
     * @return bool 連携済みの場合true
     */
    public function isUserLinkedToProvider(User $user, SocialProviderType $provider): bool
    {
        return $user->provider === $provider->value && !empty($user->provider_id);
    }
}
