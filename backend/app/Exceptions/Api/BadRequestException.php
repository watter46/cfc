<?php

declare(strict_types=1);

namespace App\Exceptions\Api;

final class BadRequestException extends ApiException
{
    /**
     * コンストラクタ
     *
     * @param  string  $message  エラーメッセージ
     * @param  array|null  $errors  エラー詳細
     */
    public function __construct(string $message = 'Bad Request', ?array $errors = null)
    {
        parent::__construct($message, 400, $errors);
    }
}
