<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

/**
 * ユーザーロールタイプ
 * 
 * システム内のユーザーロールを定義します。
 */
enum RoleType: string
{
    case User = 'user';
    case Admin = 'admin';

    /**
     * 管理者ロールかどうかを判定
     */
    public function isAdmin(): bool
    {
        return $this === self::Admin;
    }
}
