<?php

namespace App\Exceptions\Api;

use Illuminate\Validation\ValidationException as IlluminateValidationException;

class ValidationException extends ApiException
{
    /**
     * コンストラクタ
     *
     * @param IlluminateValidationException $exception バリデーション例外
     */
    public function __construct(IlluminateValidationException $exception)
    {
        parent::__construct(
            'Validation Failed',
            422,
            $exception->errors()
        );
    }
}
