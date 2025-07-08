<?php

namespace App\Exceptions;

/**
 * システム内部のエラーを表す例外
 */
class SystemException extends UserFriendlyException
{
    public function __construct(int $code = 500)
    {
        parent::__construct('system_error', [], $code);
    }
}
