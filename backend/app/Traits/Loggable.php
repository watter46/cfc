<?php

declare(strict_types=1);

namespace App\Traits;

use Exception;
use Illuminate\Support\Facades\Log;

/**
 * ログ出力を統一するためのトレイト
 *
 * このトレイトを使用することで、全てのUseCaseクラスで統一されたログ処理を実現します。
 * 処理開始、完了、警告、エラーのログを適切な形式で出力し、運用監視を容易にします。
 */
trait Loggable
{
    /**
     * 処理開始ログを出力
     *
     * @param  array  $context  処理に関するコンテキスト情報
     */
    protected function logStart(array $context = []): void
    {
        $className = class_basename(static::class);

        Log::channel('app')->info("{$className}の処理を開始しました", array_merge([
            'class'  => static::class,
            'action' => 'start',
        ], $context));
    }

    /**
     * 処理完了ログを出力（統計情報付き）
     *
     * @param  array  $stats  処理結果の統計情報（成功件数、失敗件数など）
     */
    protected function logComplete(array $stats = []): void
    {
        $className = class_basename(static::class);

        Log::channel('app')->info("{$className}の処理が完了しました", array_merge([
            'class'  => static::class,
            'action' => 'complete',
        ], $stats));
    }

    /**
     * 警告ログを出力（処理は継続するが注意が必要な場合）
     *
     * @param  string  $message  警告メッセージ
     * @param  array  $context  追加のコンテキスト情報
     */
    protected function logWarning(string $message, array $context = []): void
    {
        $className = class_basename(static::class);

        Log::channel('app')->warning("[{$className}] {$message}", array_merge([
            'class'  => static::class,
            'action' => 'warning',
        ], $context));
    }

    /**
     * エラーログを出力（例外発生時）
     *
     * @param  Exception  $exception  発生した例外
     * @param  array  $context  追加のコンテキスト情報
     */
    protected function logError(Exception $exception, array $context = []): void
    {
        $className = class_basename(static::class);

        Log::channel('app')->error("[{$className}] エラーが発生しました: {$exception->getMessage()}", array_merge([
            'class'           => static::class,
            'action'          => 'error',
            'exception_class' => get_class($exception),
            'file'            => $exception->getFile(),
            'line'            => $exception->getLine(),
            'trace'           => $exception->getTraceAsString(),
        ], $context));
    }

    /**
     * 情報ログを出力（一般的な情報記録）
     *
     * @param  string  $message  ログメッセージ
     * @param  array  $context  追加のコンテキスト情報
     */
    protected function logInfo(string $message, array $context = []): void
    {
        $className = class_basename(static::class);

        Log::channel('app')->info("[{$className}] {$message}", array_merge([
            'class'  => static::class,
            'action' => 'info',
        ], $context));
    }

    /**
     * デバッグログを出力（開発時の詳細情報）
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

        $className = class_basename(static::class);

        $debugInfo = [
            'class'   => static::class,
            'action'  => 'debug',
            'message' => $message,
        ];

        // データの型に応じて適切にフォーマット
        if ($data !== null) {
            $debugInfo['data'] = $this->formatDebugData($data);
            $debugInfo['data_type'] = $this->getDataType($data);
        }

        Log::channel('debug')->debug("[{$className}] {$message}", array_merge($debugInfo, $context));
    }

    /**
     * デバッグ用データのフォーマット
     *
     * @param  mixed  $data  フォーマット対象のデータ
     * @return mixed フォーマット済みのデータ
     */
    protected function formatDebugData($data)
    {
        // 配列やオブジェクトはprint_rで整形して改行付きで返す
        if (is_array($data) || is_object($data)) {
            return print_r($data, true);
        }

        return $data;
    }

    /**
     * データ型の取得
     *
     * @param  mixed  $data  型を取得する対象のデータ
     * @return string データ型
     */
    protected function getDataType($data): string
    {
        return gettype($data);
    }
}
