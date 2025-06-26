<?php

declare(strict_types=1);

namespace App\UseCases\Auth\Login;

use App\Http\Resources\AuthResource;
use App\Models\User;
use App\Traits\Loggable;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Hash;

/**
 * ログイン処理のユースケースクラス
 *
 * ユーザー認証を行い、成功時にはトークンとユーザー情報を含む
 * レスポンスデータを生成します。
 */
final readonly class LoginAction
{
    use Loggable;

    /**
     * ログイン処理を実行
     *
     * @param array $data ログインリクエストデータ（email、password）
     * @return AuthResource 認証成功時のレスポンスリソース
     * @throws AuthenticationException 認証に失敗した場合
     */
    public function execute(array $data): AuthResource
    {
        $this->logStart(['email' => $data['email']]);

        try {
            // ユーザーの存在確認
            $user = User::where('email', $data['email'])->first();

            if (!$user || !Hash::check($data['password'], $user->password)) {
                throw new AuthenticationException('認証に失敗しました。');
            }

            // トークン生成
            $token = $user->createToken('auth_token')->plainTextToken;

            // レスポンスデータの構築
            $authData = [
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => $user
            ];

            $this->logComplete(['user_id' => $user->ulid]);

            return new AuthResource((object) $authData);

        } catch (AuthenticationException $e) {
            $this->logWarning('認証失敗', ['email' => $data['email']]);
            throw $e;
        }
    }
}
