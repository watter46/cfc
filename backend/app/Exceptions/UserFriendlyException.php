<?php

namespace App\Exceptions;

use Exception;

/**
 * ユーザー向けエラーメッセージを提供する基底クラス
 */
class UserFriendlyException extends Exception
{
    protected string $userMessage;

    public function __construct(string $messageKey, array $placeholders = [], int $code = 400, ?Exception $previous = null)
    {
        $this->userMessage = trans($messageKey, $placeholders);
        parent::__construct($this->userMessage, $code, $previous);
    }

    /**
     * ユーザー向けメッセージを取得
     */
    public function getUserMessage(): string
    {
        return $this->userMessage;
    }
}
