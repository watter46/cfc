<?php

declare(strict_types=1);

namespace App\UseCases\Auth\Signup;

use App\Http\Resources\Auth\UserResource;
use App\Models\User;
use App\Traits\Loggable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * ユーザー登録処理のユースケースクラス
 *
 * 新規ユーザーの登録を行い、セッションベースの認証を設定します。
 * 成功時にはユーザー情報を返します。
 */
final readonly class SignupAction
{
    use Loggable;

    /**
     * ユーザー登録処理を実行
     *
     * @param array $data 登録リクエストデータ（name、email、password）
     * @return UserResource 登録成功時のユーザーリソース
     */
    public function execute(array $data): UserResource
    {
        $this->logStart(['email' => $data['email'], 'name' => $data['name']]);

        // ユーザー作成
        $user = User::create([
            'ulid' => Str::ulid()->toBase32(),
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        // セッションベースのログイン
        Auth::login($user);

        $this->logComplete(['user_id' => $user->ulid]);

        return new UserResource($user);
    }
}
