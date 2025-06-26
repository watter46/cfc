<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * ユーザー情報のAPIリソース
 * 
 * ユーザー情報をAPIレスポンス用にフォーマットします。
 * 機密情報（パスワード、2段階認証シークレット等）は除外します。
 */
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->ulid, // ULIDをidキーで返すことでフロントエンドの実装をシンプルに
            'name' => $this->name,
            'email' => $this->email,
        ];
    }
}
