<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class PlayerStatistic extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'game_player_id',
        'shots_total',
        'shots_on_target',
        'passes_total',
        'passes_accuracy',
        'key_passes',
        'tackles',
        'blocks',
        'interceptions',
        'duels_won',
        'duels_total',
        'dribbles_success',
        'dribbles_attempts',
        'fouls_committed',
        'fouls_drawn',
        'yellow_cards',
        'red_cards',
        'saves',
        'goals_conceded',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'passes_accuracy' => 'float',
        ];
    }

    /**
     * 関連する試合出場選手を取得
     */
    public function gamePlayer(): BelongsTo
    {
        return $this->belongsTo(GamePlayer::class);
    }
}
