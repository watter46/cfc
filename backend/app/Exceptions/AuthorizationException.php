<?php

namespace App\Exceptions;

/**
 * 権限エラーを表す例外
 */
class AuthorizationException extends UserFriendlyException
{
    public function __construct(int $code = 403)
    {
        parent::__construct('authorization_error', [], $code);
    }
}
