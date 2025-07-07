<?php

declare(strict_types=1);

namespace App\UseCases\Auth\Signout;

use App\Traits\Loggable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * サインアウト処理のユースケースクラス
 *
 * セッションベースの認証でログアウト処理を行います。
 * セッションの無効化とCSRFトークンの再生成を実行します。
 */
final readonly class SignoutAction
{
    use Loggable;

    /**
     * サインアウト処理を実行
     *
     * @param Request $request リクエストオブジェクト
     * @return bool サインアウト成功時true
     */
    public function execute(Request $request): bool
    {
        $user = $request->user();
        
        if (!$user) {
            $this->logWarning('未認証ユーザーによるサインアウト試行');
            return false;
        }

        $this->logStart(['user_id' => $user->ulid]);

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        $this->logComplete(['user_id' => $user->ulid]);

        return true;
    }
}
