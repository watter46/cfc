<?php

declare(strict_types=1);

namespace App\UseCases\Auth\Register;

use App\Http\Resources\AuthResource;
use App\Models\User;
use App\Traits\Loggable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * ユーザー登録処理のユースケースクラス
 *
 * 新規ユーザーの登録を行い、成功時にはトークンとユーザー情報を含む
 * レスポンスデータを生成します。
 */
final readonly class RegisterAction
{
    use Loggable;

    /**
     * ユーザー登録処理を実行
     *
     * @param array $data 登録リクエストデータ（name、email、password）
     * @return AuthResource 登録成功時のレスポンスリソース
     */
    public function execute(array $data): AuthResource
    {
        $this->logStart(['email' => $data['email'], 'name' => $data['name']]);

        // ユーザー作成
        $user = User::create([
            'ulid' => Str::ulid()->toBase32(),
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

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
    }
}
