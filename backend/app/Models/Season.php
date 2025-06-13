<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Builders\SeasonBuilder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Season extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'start_date',
        'end_date',
        'year',
        'is_current',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_current' => 'boolean',
        ];
    }

    /**
     * ビルダーをカスタマイズ
     */
    public static function query(): SeasonBuilder
    {
        return parent::query();
    }

    /**
     * Eloquentビルダーのカスタマイズ
     */
    public function newEloquentBuilder($query): SeasonBuilder
    {
        return new SeasonBuilder($query);
    }

    /**
     * シーズンに関連する試合を取得
     */
    public function games(): HasMany
    {
        return $this->hasMany(Game::class);
    }

    /**
     * シーズンに関連する選手を取得
     */
    public function players(): HasMany
    {
        return $this->hasMany(Player::class);
    }
}
