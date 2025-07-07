<?php

declare(strict_types=1);

namespace App\Http\Requests\User\Game;

use App\Http\Requests\ApiRequest;

/**
 * 試合詳細取得リクエストのバリデーションクラス
 *
 * /api/matches/{id}エンドポイントのリクエストパラメータを検証します。
 */
final class FindGameRequest extends ApiRequest
{
    /**
     * 認可処理
     *
     * @return bool 認証済みユーザーのみアクセス許可
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * バリデーションルール
     *
     * @return array<string, mixed> バリデーションルールの配列
     */
    public function rules(): array
    {
        return [
            'id' => [
                'required',
                'integer',
                'min:1',
                'exists:games,id',
            ],
        ];
    }

    /**
     * バリデーション属性名の日本語化
     *
     * @return array<string, string> 属性名の日本語マッピング
     */
    public function attributes(): array
    {
        return [
            'id' => '試合ID',
        ];
    }

    /**
     * カスタムエラーメッセージ
     *
     * @return array<string, string> エラーメッセージの配列
     */
    public function messages(): array
    {
        return [
            'id.required' => '試合IDは必須です。',
            'id.integer'  => '試合IDは整数で指定してください。',
            'id.min'      => '試合IDは1以上で指定してください。',
            'id.exists'   => '指定された試合が見つかりません。',
        ];
    }
}
