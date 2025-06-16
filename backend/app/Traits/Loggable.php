<?php

declare(strict_types=1);

namespace App\Traits;

use Exception;
use Illuminate\Support\Facades\Log;

/**
 * ログ機能を提供するTrait
 *
 * 最低限のログ出力機能を統一的に提供します。
 * 各クラスで簡潔にログ処理を実装できるようになります。
 */
trait Loggable
{
    /**
     * 処理開始ログ
     *
     * @param  array  $context  ログに含める追加情報
     */
    protected function logStart(array $context = []): void
    {
        $className = class_basename(static::class);

        Log::info("{$className}を開始", array_merge([
            'class' => $className,
        ], $context));
    }

    /**
     * 処理完了ログ
     *
     * @param  array  $context  ログに含める追加情報
     */
    protected function logComplete(array $context = []): void
    {
        $className = class_basename(static::class);

        Log::info("{$className}が完了", array_merge([
            'class' => $className,
        ], $context));
    }

    /**
     * 警告ログ
     *
     * @param  string  $message  警告メッセージ
     * @param  array  $context  ログに含める追加情報
     */
    protected function logWarning(string $message, array $context = []): void
    {
        Log::warning($message, array_merge([
            'class' => class_basename(static::class),
        ], $context));
    }

    /**
     * エラーログ
     *
     * @param  Exception  $exception  発生した例外
     * @param  array  $context  ログに含める追加情報
     */
    protected function logError(Exception $exception, array $context = []): void
    {
        Log::error($exception->getMessage(), array_merge([
            'class' => class_basename(static::class),
            'error' => $exception->getMessage(),
        ], $context));
    }

    /**
     * デバッグログ（開発環境でのみ出力）
     *
     * 変数の中身を詳細に出力し、開発時のデバッグを支援します。
     * 本番環境では出力されません。
     *
     * @param  string  $message  デバッグメッセージ
     * @param  mixed  $data  デバッグ対象のデータ
     * @param  array  $context  追加のコンテキスト情報
     */
    protected function logDebug(string $message, $data = null, array $context = []): void
    {
        // 本番環境では出力しない
        if (config('app.env') === 'production') {
            return;
        }

        $debugInfo = [
            'class'   => class_basename(static::class),
            'message' => $message,
        ];

        // データの型に応じて適切にフォーマット
        if ($data !== null) {
            $debugInfo['data'] = $this->formatDebugData($data);
            $debugInfo['data_type'] = $this->getDataType($data);
        }

        Log::debug("🐛 [DEBUG] {$message}", array_merge($debugInfo, $context));
    }
}
