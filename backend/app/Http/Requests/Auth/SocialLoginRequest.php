<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use App\Http\Controllers\Auth\SocialProviderType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * ソーシャルログインリクエストのバリデーションクラス
 * 
 * プロバイダータイプの妥当性を検証し、認可処理を行います。
 */
class SocialLoginRequest extends FormRequest
{
    /**
     * リクエストの認可を判定
     * 
     * ソーシャルログインは認証前のため、常にtrueを返します。
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * バリデーションルールを定義
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'provider' => [
                'required',
                'string',
                Rule::in(array_column(SocialProviderType::cases(), 'value')),
            ],
        ];
    }

    /**
     * カスタムエラーメッセージを定義
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'provider.required' => 'プロバイダーを指定してください。',
            'provider.string' => 'プロバイダーは文字列で指定してください。',
            'provider.in' => 'サポートされていないプロバイダーです。GoogleまたはXを指定してください。',
        ];
    }

    /**
     * バリデーション済みプロバイダータイプを取得
     */
    public function getProviderType(): SocialProviderType
    {
        return SocialProviderType::from($this->validated('provider'));
    }
}
