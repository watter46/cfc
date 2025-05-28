<?php

declare(strict_types = 1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Player extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'team_id',
        'season_id',
        'name',
        'name_plain',
        'position',
        'number',
        'api_player_id',
        'nationality',
        'birth_date',
        'height',
        'weight',
        'image_path',
        'is_fetched',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'is_fetched' => 'boolean',
        ];
    }

    /**
     * 選手が所属するチームを取得
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * 選手が所属するシーズンを取得
     */
    public function season(): BelongsTo
    {
        return $this->belongsTo(Season::class);
    }

    /**
     * 選手が参加した試合を取得
     */
    public function games(): BelongsToMany
    {
        return $this->belongsToMany(Game::class, 'game_players')
            ->withPivot([
                'id',
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
            ]);
    }

    public function gamesWithId(): BelongsToMany
    {
        return $this->belongsToMany(Game::class, 'game_players')
            ->withPivot('id');
    }

    /**
     * 選手の試合出場情報を取得
     */
    public function gamePlayers(): HasMany
    {
        return $this->hasMany(GamePlayer::class);
    }
}
