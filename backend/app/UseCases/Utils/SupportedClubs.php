<?php

declare(strict_types = 1);

namespace App\UseCases\Utils;

use Illuminate\Support\Collection;

enum SupportedClubs: int
{
    case CHELSEA = 49;

    /**
     * クラブ名を取得
     *
     * @return string
     */
    public function name(): string
    {
        return match($this) {
            self::CHELSEA => 'Chelsea FC',
        };
    }

    /**
     * 指定されたIDのクラブが存在するか確認
     *
     * @param  int  $id
     * @return bool
     */
    public static function exists(int $id): bool
    {
        foreach (self::cases() as $case) {
            if ($case->value === $id) {
                return true;
            }
        }

        return false;
    }

    /**
     * サポートされているクラブのIDを取得
     *
     * @return Collection<int>
     */
    public static function ids(): Collection
    {
        return collect(self::cases())->pluck('value');
    }
}
