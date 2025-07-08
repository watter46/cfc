<?php

declare(strict_types=1);

namespace App\Logging;

use Illuminate\Log\Logger;
use Monolog\Formatter\JsonFormatter;

/**
 * カスタムJSON形式でログを出力するフォーマッタークラス
 *
 * 全てのログを統一されたJSON形式で出力し、構造化されたログデータを提供します。
 * これにより、ログの解析や検索が容易になり、運用監視の効率が向上します。
 */
class CustomJsonFormatter
{
    /**
     * ログチャンネルに統一されたJSON形式のフォーマッターを適用
     *
     * @param  Logger  $logger  Laravelのログインスタンス
     */
    public function __invoke(Logger $logger): void
    {
        foreach ($logger->getHandlers() as $handler) {
            $formatter = new JsonFormatter(
                batchMode: JsonFormatter::BATCH_MODE_NEWLINES,
                appendNewline: true,
                ignoreEmptyContextAndExtra: false,
            );

            // タイムスタンプフォーマットを統一（ISO 8601形式）
            $formatter->includeStacktraces(true);

            $handler->setFormatter($formatter);
        }
    }
}
