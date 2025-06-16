<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class ApiController extends Controller
{
    /**
     * 成功レスポンスを返す
     *
     * @param  mixed  $data  レスポンスデータ
     * @param  string  $message  メッセージ
     * @param  int  $statusCode  ステータスコード
     */
    protected function successResponse($data = null, string $message = 'Success', int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $statusCode);
    }

    /**
     * エラーレスポンスを返す
     *
     * @param  string  $message  エラーメッセージ
     * @param  int  $statusCode  ステータスコード
     * @param  mixed  $errors  エラー詳細
     */
    protected function errorResponse(string $message = 'Error', int $statusCode = 400, $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }
}
