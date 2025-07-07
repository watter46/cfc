<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class GameUser extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'game_id',
        'mom_count',
        'mom_game_player_id',
        'is_rated',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_rated' => 'boolean',
        ];
    }

    /**
     * モデルのデフォルト属性値
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'is_rated' => false,
    ];

    /**
     * 関連するユーザーを取得
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 関連する試合を取得
     */
    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    /**
     * マンオブザマッチに選んだ選手を取得
     */
    public function momGamePlayer(): BelongsTo
    {
        return $this->belongsTo(GamePlayer::class, 'mom_game_player_id');
    }
}
