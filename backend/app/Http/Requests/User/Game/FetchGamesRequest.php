<?php

declare(strict_types=1);

namespace App\Http\Requests\User\Game;

use App\Http\Requests\ApiRequest;

/**
 * ゲーム一覧取得リクエストのバリデーションクラス
 *
 * /api/matchesエンドポイントのリクエストパラメータを検証します。
 */
final class FetchGamesRequest extends ApiRequest
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
            'page'   => 'sometimes|integer|min:1',
            'season' => [
                'sometimes',
                'digits:4',
                'integer',
                'min:2024',
                'max:'.(date('Y') + 1),
            ],
            'league' => [
                'sometimes',
                'integer',
                'min:1',
            ],
            'team' => [
                'sometimes',
                'integer',
                'min:1',
            ],
        ];
    }

    /**
     * バリデーションエラーメッセージのカスタマイズ
     *
     * @return array<string, string> カスタムメッセージの配列
     */
    public function messages(): array
    {
        return [
            'page.integer'   => 'ページ番号は数値で指定してください。',
            'page.min'       => 'ページ番号は1以上で指定してください。',
            'season.digits'  => 'シーズンは4桁の数字で指定してください。',
            'season.min'     => 'シーズンは2024年以降の値を指定してください。',
            'season.max'     => 'シーズンの値が現実的な上限を超えています。',
            'league.integer' => 'リーグIDは整数で指定してください。',
            'league.min'     => 'リーグIDは1以上の整数で指定してください。',
            'team.integer'   => 'チームIDは整数で指定してください。',
            'team.min'       => 'チームIDは1以上の整数で指定してください。',
        ];
    }
}
