<?php

namespace App\Exceptions;

/**
 * 入力データのバリデーションエラーを表す例外
 */
class ValidationException extends UserFriendlyException
{
    public function __construct(array $errors, int $code = 422)
    {
        parent::__construct('validation_error', ['errors' => json_encode($errors)], $code);
    }
}
