<?php

declare(strict_types=1);

namespace App\Exceptions\Auth;

use Exception;

/**
 * ソーシャルログイン例外クラス
 * 
 * ソーシャルログイン処理中に発生する例外を表現します。
 */
class SocialLoginException extends Exception
{
    /**
     * プロバイダーからのユーザー情報取得に失敗した場合
     */
    public static function userInfoRetrievalFailed(string $provider, ?Exception $previous = null): self
    {
        return new self(
            "プロバイダー「{$provider}」からのユーザー情報取得に失敗しました。",
            400,
            $previous
        );
    }

    /**
     * サポートされていないプロバイダーが指定された場合
     */
    public static function unsupportedProvider(string $provider): self
    {
        return new self(
            "サポートされていないプロバイダー「{$provider}」が指定されました。",
            400
        );
    }

    /**
     * プロバイダーIDが重複している場合
     */
    public static function providerIdConflict(string $provider, string $providerId): self
    {
        return new self(
            "プロバイダー「{$provider}」のID「{$providerId}」は既に別のユーザーによって使用されています。",
            409
        );
    }

    /**
     * 必須情報が不足している場合
     */
    public static function missingRequiredInfo(string $field): self
    {
        return new self(
            "ソーシャルログインに必要な情報「{$field}」が不足しています。",
            400
        );
    }
}
