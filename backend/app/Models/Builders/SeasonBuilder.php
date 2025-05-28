<?php

declare(strict_types = 1);

namespace App\Models\Builders;

use Illuminate\Database\Eloquent\Builder;

class SeasonBuilder extends Builder
{
    /**
     * 現在のシーズンを取得
     *
     * @return self
     */
    public function current(): self
    {
        return $this->where('is_current', true);
    }

    /**
     * 特定の年のシーズンを取得
     *
     * @param  int  $year
     * @return self
     */
    public function byYear(int $year): self
    {
        return $this->where('year_start', $year);
    }
}
