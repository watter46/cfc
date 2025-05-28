<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ApiLogger
{
    /**
     * APIリクエストとレスポンスをログに記録する
     *
     * @param Request $request
     * @param Closure $next
     * @return Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        // リクエスト情報をログに記録
        $this->logRequest($request);

        // レスポンスを取得
        $response = $next($request);

        // レスポンス情報をログに記録
        $this->logResponse($request, $response);

        return $response;
    }

    /**
     * リクエスト情報をログに記録
     *
     * @param Request $request
     * @return void
     */
    protected function logRequest(Request $request): void
    {
        // 機密情報をマスクするためのパラメータリスト
        $sensitiveParams = ['password', 'password_confirmation', 'current_password', 'token', 'api_key'];

        // リクエストデータを取得（機密情報はマスク）
        $requestData = $request->all();
        foreach ($sensitiveParams as $param) {
            if (isset($requestData[$param])) {
                $requestData[$param] = '********';
            }
        }

        // リクエスト情報をログに記録
        $logData = [
            'id' => uniqid('req_'),
            'ip' => $request->ip(),
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'user_agent' => $request->header('User-Agent'),
            'user_id' => Auth::id() ?? 'guest',
            'params' => $requestData,
            'headers' => $this->getRequestHeaders($request),
        ];

        Log::channel('api_request')->info('API Request', $logData);
    }

    /**
     * レスポンス情報をログに記録
     *
     * @param Request $request
     * @param Response $response
     * @return void
     */
    protected function logResponse(Request $request, Response $response): void
    {
        // レスポンスデータを取得
        $responseContent = $response->getContent();
        $responseData = json_decode($responseContent, true) ?? $responseContent;

        // レスポンス情報をログに記録
        $logData = [
            'id' => uniqid('res_'),
            'request_url' => $request->fullUrl(),
            'status' => $response->getStatusCode(),
            'duration' => defined('LARAVEL_START') ? round((microtime(true) - LARAVEL_START) * 1000, 2) . 'ms' : null,
            'response' => $responseData,
        ];

        // エラーレスポンスの場合はエラーログにも記録
        if ($response->getStatusCode() >= 400) {
            Log::channel('api_error')->error('API Error Response', $logData);
        }

        Log::channel('api_request')->info('API Response', $logData);
    }

    /**
     * リクエストヘッダーを取得（機密情報はマスク）
     *
     * @param Request $request
     * @return array
     */
    protected function getRequestHeaders(Request $request): array
    {
        $headers = $request->headers->all();

        // 機密情報を含むヘッダーをマスク
        $sensitiveHeaders = ['authorization', 'cookie', 'x-csrf-token'];

        foreach ($sensitiveHeaders as $header) {
            if (isset($headers[$header])) {
                $headers[$header] = ['********'];
            }
        }

        return $headers;
    }
}
