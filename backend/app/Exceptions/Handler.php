<?php

declare(strict_types = 1);

namespace App\Exceptions;

use App\Exceptions\Api\ApiException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [
        //
    ];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * APIリクエストに対する例外レンダリング
     *
     * @param  Request      $request
     * @param  Throwable    $e
     * @return JsonResponse
     */
    protected function renderApiException(Request $request, Throwable $e): JsonResponse
    {
        // カスタムAPI例外の場合はそのままレンダリング
        if ($e instanceof ApiException) {
            return $e->render();
        }

        // バリデーション例外の場合
        if ($e instanceof ValidationException) {
            return (new Api\ValidationException($e))->render();
        }

        // 認証エラーの場合
        if ($e instanceof AuthenticationException) {
            return (new Api\UnauthorizedException($e->getMessage()))->render();
        }

        // HTTPエラーの場合
        if ($e instanceof HttpException) {
            $statusCode = $e->getStatusCode();
            $message = $e->getMessage() ?: 'HTTP Error';

            return (new ApiException($message, $statusCode))->render();
        }

        // その他のエラー（500 Internal Server Error）
        $statusCode = 500;
        $message = config('app.debug') ? $e->getMessage() : 'Server Error';

        return (new ApiException($message, $statusCode))->render();
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  Request                                    $request
     * @param  Throwable                                  $e
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @throws Throwable
     */
    public function render($request, Throwable $e)
    {
        // APIリクエストの場合は専用のレンダリングを行う
        if ($request->expectsJson() || $request->is('api/*')) {
            return $this->renderApiException($request, $e);
        }

        return parent::render($request, $e);
    }
}
