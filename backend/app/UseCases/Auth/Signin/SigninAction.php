<?php

declare(strict_types=1);

namespace App\UseCases\Auth\Signin;

use App\Http\Resources\Auth\UserResource;
use App\Models\User;
use App\Traits\Loggable;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

/**
 * サインイン処理のユースケースクラス
 *
 * ユーザー認証を行い、セッションベースの認証を設定します。
 * 成功時にはユーザー情報を返します。
 */
final readonly class SigninAction
{
    use Loggable;

    /**
     * サインイン処理を実行
     *
     * @param array $data サインインリクエストデータ（email、password）
     * @return UserResource 認証成功時のユーザーリソース
     * @throws AuthenticationException 認証に失敗した場合
     */
    public function execute(array $data): UserResource
    {
        $this->logStart(['email' => $data['email']]);
        
        // デバッグログ: リクエストデータの確認
        $this->logDebug('サインインリクエストデータを受信', [
            'email' => $data['email'],
            'has_password' => !empty($data['password']),
        ]);

        try {
            // ユーザーの存在確認
            $user = User::where('email', $data['email'])->first();
            
            // デバッグログ: ユーザー検索結果
            $this->logDebug('ユーザー検索完了', [
                'email' => $data['email'],
                'user_found' => $user !== null,
                'user_id' => $user?->ulid,
            ]);

            if (!$user || !Hash::check($data['password'], $user->password)) {
                throw new AuthenticationException('認証に失敗しました。');
            }

            // セッションベースのログイン
            Auth::login($user);
            
            // デバッグログ: 認証完了
            $this->logDebug('認証処理完了', [
                'user_id' => $user->ulid,
                'auth_id' => Auth::id(),
            ]);

            $this->logComplete(['user_id' => $user->ulid]);

            return new UserResource($user);

        } catch (AuthenticationException $e) {
            $this->logWarning('認証失敗', ['email' => $data['email']]);
            throw $e;
        }
    }
}
