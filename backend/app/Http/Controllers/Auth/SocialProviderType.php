<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

/**
 * ソーシャルログインプロバイダータイプ
 * 
 * 対応するソーシャルログインプロバイダーを定義します。
 */
enum SocialProviderType: string
{
    case X = 'x';
    case Google = 'google';
}
