<?php

declare(strict_types=1);

namespace App\Exceptions;

use App\Traits\Loggable;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Throwable;

/**
 * アプリケーション例外ハンドラー
 *
 * カスタム例外クラスに対応し、ユーザー向けレスポンスと開発者向けログを適切に処理します。
 */
final class Handler extends ExceptionHandler
{
    use Loggable;

    /**
     * 報告しない例外タイプ
     *
     * @var array<int, class-string<Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * セッションにフラッシュしない入力項目
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * 例外処理コールバックの登録
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * HTTPレスポンスへの例外レンダリング
     */
    public function render($request, Throwable $e)
    {
        // APIリクエストの場合
        if ($request->expectsJson() || $request->is('api/*')) {
            return $this->renderApiException($request, $e);
        }

        return parent::render($request, $e);
    }

    /**
     * APIリクエストに対する例外レンダリング
     */
    protected function renderApiException(Request $request, Throwable $e): JsonResponse
    {
        // UserFriendlyException（カスタム例外）の場合
        if ($e instanceof UserFriendlyException) {
            $this->logUserFriendlyException($e, []);

            return response()->json([
                'message' => $e->getUserMessage(),
                'success' => false,
            ], $e->getCode());
        }

        // Laravel標準のバリデーション例外
        if ($e instanceof ValidationException) {
            $this->logValidationError($e->errors(), []);

            return response()->json([
                'message' => trans('validation_error'),
                'errors'  => $e->errors(),
                'success' => false,
            ], 422);
        }

        // Laravel標準の認証例外
        if ($e instanceof AuthenticationException) {
            $this->logAuthenticationError($e->getMessage(), []);

            return response()->json([
                'message' => trans('authentication_error'),
                'success' => false,
            ], 401);
        }

        // その他のシステムエラー
        $this->logSystemError($e, []);

        return response()->json([
            'message' => trans('system_error'),
            'success' => false,
        ], 500);
    }
}
