<?php

namespace App\Exceptions;

/**
 * 業務ロジックのエラーを表す例外
 */
class BusinessLogicException extends UserFriendlyException
{
    public function __construct(string $message, int $code = 400)
    {
        parent::__construct('business_logic_error', ['message' => $message], $code);
    }
}
