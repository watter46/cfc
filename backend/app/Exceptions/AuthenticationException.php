<?php

namespace App\Exceptions;

/**
 * 認証エラーを表す例外
 */
class AuthenticationException extends UserFriendlyException
{
    public function __construct(int $code = 401)
    {
        parent::__construct('authentication_error', [], $code);
    }
}
