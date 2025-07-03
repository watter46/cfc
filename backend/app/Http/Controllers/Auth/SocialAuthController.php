<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Exceptions\Auth\SocialLoginException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SocialLoginRequest;
use App\Http\Resources\Auth\UserResource;
use App\Traits\Loggable;
use App\UseCases\Auth\Social\SocialLoginAction;
use Exception;
use Illuminate\Http\JsonResponse;
use Laravel\Socialite\Facades\Socialite;

/**
 * ソーシャルログイン認証コントローラー
 * 
 * Google・Xを使用したOAuth認証を処理し、
 * セッションベースの認証でログイン状態を管理します。
 * 
 * ビジネスロジックはUseCaseに委譲し、Controllerは薄く保ちます。
 */
final class SocialAuthController extends Controller
{
    use Loggable;

    public function __construct(
        private readonly SocialLoginAction $socialLoginAction
    ) {}

    /**
     * ソーシャルログインプロバイダーへのリダイレクト
     * 
     * @param SocialProviderType $provider プロバイダータイプ（google|x）
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function redirect(SocialProviderType $provider)
    {
        $this->logStart(['provider' => $provider->value]);

        try {
            return Socialite::driver($provider->value)->redirect();
        } catch (Exception $e) {
            $this->logError($e, ['provider' => $provider->value]);
            throw $e;
        }
    }

    /**
     * ソーシャルログインプロバイダーからのコールバック処理
     * 
     * @param SocialProviderType $provider プロバイダータイプ（google|x）
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function callback(SocialProviderType $provider)
    {
        $this->logStart(['provider' => $provider->value]);

        $frontendBaseUrl = config('app.frontend_url');

        try {
            // プロバイダーからユーザー情報を取得
            $socialiteUser = Socialite::driver($provider->value)->user();

            if (!$socialiteUser || !$socialiteUser->id) {
                throw SocialLoginException::userInfoRetrievalFailed($provider->value);
            }

            $result = $this->socialLoginAction->execute($socialiteUser, $provider);

            $this->logComplete([
                'user_id' => $result['user']->id,
                'provider' => $provider->value,
                'is_new_user' => $result['is_new_user']
            ]);

            $redirectUrl = "$frontendBaseUrl/auth/callback";
            
            return redirect($redirectUrl);

        } catch (SocialLoginException $e) {
            $this->logError($e, ['provider' => $provider->value]);
            $error = urlencode($e->getMessage());
            return redirect("$frontendBaseUrl/auth/callback?error={$error}");
        } catch (Exception $e) {
            $this->logError($e, ['provider' => $provider->value]);
            $error = urlencode('ログインがキャンセルされたか、認証に失敗しました');
            return redirect("$frontendBaseUrl/auth/callback?error={$error}");
        }
    }
}
