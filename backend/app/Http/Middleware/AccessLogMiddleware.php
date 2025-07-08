<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Services\Logging\LogService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * アクセスログを記録するミドルウェア
 *
 * 全てのHTTPリクエストとレスポンスの情報を記録し、
 * システムのアクセス状況を監視できるようにします。
 */
class AccessLogMiddleware
{
    /**
     * ログサービスのインスタンス
     */
    public function __construct(
        private readonly LogService $logService,
    ) {}

    /**
     * リクエスト情報をログに記録
     */
    private function logRequest(Request $request): void
    {
        $maskedParams = $this->maskSensitiveParams($request->all());
        $maskedHeaders = $this->maskSensitiveHeaders($request);

        $logData = [
            'id'         => uniqid('req_'),
            'ip'         => $request->ip(),
            'method'     => $request->method(),
            'url'        => $request->fullUrl(),
            'user_agent' => $request->header('User-Agent'),
            'user_id'    => $request->user()?->id ?? 'guest',
            'params'     => $maskedParams,
            'headers'    => $maskedHeaders,
        ];

        $this->logService->logAccess(
            method: $request->method(),
            url: $request->fullUrl(),
            status: 0, // リクエスト段階では未確定
            responseTime: 0.0, // リクエスト段階では未確定
            context: array_merge($logData, ['log_type' => 'request']),
        );
    }

    /**
     * レスポンス情報をログに記録
     */
    private function logResponse(Request $request, Response $response, float $responseTime): void
    {
        $responseContent = $response->getContent();
        $responseData = json_decode($responseContent, true) ?? $responseContent;

        $logData = [
            'id'          => uniqid('res_'),
            'request_url' => $request->fullUrl(),
            'status'      => $response->getStatusCode(),
            'duration'    => round($responseTime, 2).'ms',
            'response'    => $responseData,
        ];

        // 通常のアクセスログに記録
        $this->logService->logAccess(
            method: $request->method(),
            url: $request->fullUrl(),
            status: $response->getStatusCode(),
            responseTime: $responseTime,
            context: array_merge($logData, ['log_type' => 'response']),
        );

        // エラーレスポンスの場合は別途エラーログに記録
        if ($response->getStatusCode() >= 400) {
            $this->logService->logApiError(
                $request->fullUrl(),
                $response->getStatusCode(),
                'HTTP Error Response',
                [
                    'error_type'    => 'http_error',
                    'method'        => $request->method(),
                    'response_data' => $responseData,
                ],
            );
        }
    }

    /**
     * リクエストを処理してアクセスログを記録
     *
     * @param  Request  $request  HTTPリクエスト
     * @param  Closure  $next  次のミドルウェアまたはコントローラー
     * @return Response HTTPレスポンス
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);

        // リクエスト情報を記録
        $this->logRequest($request);

        // リクエストを処理
        $response = $next($request);

        $responseTime = (microtime(true) - $startTime) * 1000;

        // レスポンス情報を記録
        $this->logResponse($request, $response, $responseTime);

        // アクセスログを記録
        $this->logService->logAccess(
            method: $request->method(),
            url: $request->fullUrl(),
            status: $response->getStatusCode(),
            responseTime: $responseTime,
            context: [
                'user_id'       => $request->user()?->id,
                'route_name'    => $request->route()?->getName(),
                'controller'    => $this->getControllerName($request),
                'request_size'  => strlen($request->getContent()),
                'response_size' => strlen($response->getContent()),
            ],
        );

        return $response;
    }

    /**
     * リクエストからコントローラー名を取得
     *
     * @param  Request  $request  HTTPリクエスト
     * @return string|null コントローラー名
     */
    private function getControllerName(Request $request): ?string
    {
        $route = $request->route();

        if (! $route) {
            return null;
        }

        $action = $route->getAction();

        if (isset($action['controller'])) {
            return class_basename($action['controller']);
        }

        return null;
    }

    /**
     * リクエストパラメータから機密情報をマスクする
     *
     * @param  array  $params  リクエストパラメータ
     * @return array マスク済みパラメータ
     */
    private function maskSensitiveParams(array $params): array
    {
        $sensitiveParams = ['password', 'password_confirmation', 'current_password', 'token', 'api_key'];

        foreach ($sensitiveParams as $param) {
            if (isset($params[$param])) {
                $params[$param] = '********';
            }
        }

        return $params;
    }

    /**
     * リクエストヘッダーから機密情報をマスクする
     *
     * @param  Request  $request  HTTPリクエスト
     * @return array マスク済みヘッダー
     */
    private function maskSensitiveHeaders(Request $request): array
    {
        $headers = $request->headers->all();
        $sensitiveHeaders = ['authorization', 'cookie', 'x-csrf-token'];

        foreach ($sensitiveHeaders as $header) {
            if (isset($headers[$header])) {
                $headers[$header] = ['********'];
            }
        }

        return $headers;
    }
}
