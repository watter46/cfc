<?php

declare(strict_types=1);

namespace App\Services\Logging;

use Illuminate\Support\Facades\Log;

/**
 * ログのビジネスロジックを管理するサービスクラス
 *
 * 複雑なログ処理やログの集約処理を担当します。
 * 単純なログ出力はLoggableトレイトを使用し、
 * 複雑な処理はこのサービスクラスを使用します。
 */
class LogService
{
    /**
     * セキュリティイベントのログを記録
     *
     * @param  string  $event  セキュリティイベントの種類
     * @param  array  $context  イベントに関する詳細情報
     */
    public function logSecurityEvent(string $event, array $context = []): void
    {
        Log::channel('security')->warning("セキュリティイベント: {$event}", array_merge([
            'event_type' => $event,
            'timestamp'  => now()->toISOString(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ], $context));
    }

    /**
     * アクセスログを記録
     *
     * @param  string  $method  HTTPメソッド
     * @param  string  $url  アクセスされたURL
     * @param  int  $status  レスポンスステータスコード
     * @param  float  $responseTime  レスポンス時間（ミリ秒）
     * @param  array  $context  追加のコンテキスト情報
     */
    public function logAccess(string $method, string $url, int $status, float $responseTime, array $context = []): void
    {
        Log::channel('access')->info('アクセスログ', array_merge([
            'method'           => $method,
            'url'              => $url,
            'status'           => $status,
            'response_time_ms' => round($responseTime, 2),
            'ip_address'       => request()->ip(),
            'user_agent'       => request()->userAgent(),
            'timestamp'        => now()->toISOString(),
        ], $context));
    }

    /**
     * パフォーマンスログを記録
     *
     * @param  string  $operation  実行された操作
     * @param  float  $executionTime  実行時間（ミリ秒）
     * @param  array  $context  追加のコンテキスト情報
     */
    public function logPerformance(string $operation, float $executionTime, array $context = []): void
    {
        $level = $this->getPerformanceLogLevel($executionTime);

        Log::channel('app')->log($level, "パフォーマンス: {$operation}", array_merge([
            'operation'         => $operation,
            'execution_time_ms' => round($executionTime, 2),
            'timestamp'         => now()->toISOString(),
        ], $context));
    }

    /**
     * バッチ処理の統計ログを記録
     *
     * @param  string  $batchName  バッチ処理名
     * @param  array  $statistics  処理統計情報
     */
    public function logBatchStatistics(string $batchName, array $statistics): void
    {
        Log::channel('app')->info("バッチ処理統計: {$batchName}", array_merge([
            'batch_name' => $batchName,
            'timestamp'  => now()->toISOString(),
        ], $statistics));
    }

    /**
     * APIエラーログを記録
     *
     * @param  string  $endpoint  APIエンドポイント
     * @param  int  $statusCode  エラーステータスコード
     * @param  string  $errorMessage  エラーメッセージ
     * @param  array  $context  追加のコンテキスト情報
     */
    public function logApiError(string $endpoint, int $statusCode, string $errorMessage, array $context = []): void
    {
        Log::channel('app')->error("APIエラー: {$endpoint}", array_merge([
            'endpoint'      => $endpoint,
            'status_code'   => $statusCode,
            'error_message' => $errorMessage,
            'timestamp'     => now()->toISOString(),
            'ip_address'    => request()->ip(),
        ], $context));
    }

    /**
     * 実行時間に基づいてパフォーマンスログのレベルを決定
     *
     * @param  float  $executionTime  実行時間（ミリ秒）
     * @return string ログレベル
     */
    private function getPerformanceLogLevel(float $executionTime): string
    {
        if ($executionTime > 5000) { // 5秒以上
            return 'error';
        } elseif ($executionTime > 2000) { // 2秒以上
            return 'warning';
        } else {
            return 'info';
        }
    }
}
