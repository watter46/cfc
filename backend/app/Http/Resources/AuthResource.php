<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * 認証レスポンス用のAPIリソース
 * 
 * ログイン・登録処理の成功時にトークンとユーザー情報を
 * 統一的なフォーマットで返すためのリソースクラスです。
 */
class AuthResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'token' => $this->resource->token,
            'token_type' => $this->resource->token_type ?? 'Bearer',
            'user' => new UserResource($this->resource->user),
        ];
    }
}
