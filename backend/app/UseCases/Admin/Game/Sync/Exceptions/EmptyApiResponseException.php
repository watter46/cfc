<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Exceptions;

/**
 * API応答にデータが含まれていない場合の例外
 */
final class EmptyApiResponseException extends SyncException
{
    public function __construct(string $dataType = '')
    {
        $message = empty($dataType)
            ? 'API応答にデータが含まれていません。'
            : "API応答に{$dataType}データが含まれていません。";

        parent::__construct($message);
    }
}
