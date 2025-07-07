<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Builders\SeasonBuilder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;
use RuntimeException;

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

    /**
     * シーズン名を生成するアクセサ
     *
     * ex. 2024 - 2025(2024年シーズン)
     */
    public function getNameAttribute(): string
    {
        if (! $this->year) {
            throw new RuntimeException('yearカラムを取得できるようにしてください.');
        }

        return $this->year.' - '.($this->year + 1);
    }

    /**
     * 指定されたチームが所属するリーグを取得
     *
     * @param  int  $teamId  チームID
     * @return Collection リーグのコレクション
     */
    public function leaguesByTeamId(int $teamId): Collection
    {
        return $this->games()
            ->where(function ($query) use ($teamId) {
                $query->where('home_team_id', $teamId)
                    ->orWhere('away_team_id', $teamId);
            })
            ->with('league:id,name,logo_path') // リーグ情報をロード
            ->get()
            ->pluck('league') // ゲームからリーグを抽出
            ->unique('id') // 重複を排除
            ->values(); // インデックスをリセット
    }
}
