<?php

declare(strict_types=1);

namespace App\Exceptions\Api;

use Exception;
use Illuminate\Http\JsonResponse;

class ApiException extends Exception
{
    /**
     * @var int HTTPステータスコード
     */
    protected int $statusCode = 500;

    /**
     * @var array|null エラー詳細
     */
    protected ?array $errors = null;

    /**
     * コンストラクタ
     *
     * @param  string  $message  エラーメッセージ
     * @param  int  $statusCode  HTTPステータスコード
     * @param  array|null  $errors  エラー詳細
     */
    public function __construct(string $message = 'Server Error', ?int $statusCode = null, ?array $errors = null)
    {
        parent::__construct($message);

        if ($statusCode !== null) {
            $this->statusCode = $statusCode;
        }

        $this->errors = $errors;
    }

    /**
     * HTTPステータスコードを取得
     */
    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    /**
     * エラー詳細を取得
     */
    public function getErrors(): ?array
    {
        return $this->errors;
    }

    /**
     * JSONレスポンスを生成
     */
    public function render(): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $this->getMessage(),
        ];

        if ($this->errors !== null) {
            $response['errors'] = $this->errors;
        }

        return response()->json($response, $this->statusCode);
    }
}
