<?php

declare(strict_types=1);

namespace App\Models\Builders;

use Illuminate\Database\Eloquent\Builder;

final class SeasonBuilder extends Builder
{
    /**
     * 現在のシーズンを取得
     */
    public function current(): self
    {
        return $this->where('is_current', true);
    }

    /**
     * 特定の年のシーズンを取得
     */
    public function byYear(?int $year): self
    {
        if ($year === null) {
            return $this->current();
        }

        return $this->where('year', $year);
    }
}
