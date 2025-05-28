<?php

declare(strict_types = 1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Auth;

class GamePlayer extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'game_id',
        'player_id',
        'is_starter',
        'grid',
        'position',
        'minutes_played',
        'assists',
        'goals',
        'api_rating',
        'avg_user_rating',
        'user_rating_count',
        'is_mom',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_starter' => 'boolean',
            'api_rating' => 'float',
            'avg_user_rating' => 'float',
        ];
    }

    /**
     * 関連する試合を取得
     */
    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    /**
     * 関連する選手を取得
     */
    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }

    /**
     * ユーザー評価を取得
     */
    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }

    /**
     * 現在のユーザーの評価を取得
     */
    public function myRating(): HasOne
    {
        return $this->hasOne(Rating::class)
            ->where('user_id', Auth::id());
    }

    /**
     * フィールドプレイヤーの詳細統計を取得
     */
    public function playerStatistic(): HasOne
    {
        return $this->hasOne(PlayerStatistic::class);
    }

    /**
     * ゴールキーパーかどうかを判定
     */
    public function isGoalkeeper(): bool
    {
        return $this->position === 'G';
    }
}
