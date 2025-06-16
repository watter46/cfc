<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Builders\GameBuilder;
use Illuminate\Database\Eloquent\Casts\AsCollection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

final class Game extends Model
{
    use HasFactory;

    protected $dates = ['started_at', 'finished_at', 'updated_at'];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'score'              => AsCollection::class,
            'is_end'             => 'boolean',
            'is_details_fetched' => 'boolean',
        ];
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'api_fixture_id',
        'home_team_id',
        'away_team_id',
        'winner_team_id',
        'league_id',
        'season_id',
        'score',
        'is_end',
        'is_details_fetched',
        'started_at',
        'finished_at',
    ];

    /**
     * ビルダーをカスタマイズ
     */
    public static function query(): GameBuilder
    {
        return parent::query();
    }

    /**
     * エロクエントビルダーのカスタマイズ
     */
    public function newEloquentBuilder($query): GameBuilder
    {
        return new GameBuilder($query);
    }

    /**
     * フォーマットされた開始日時を取得
     */
    protected function getFormattedStartedAtAttribute(): string
    {
        return Carbon::parse($this->attributes['started_at'])->format('m/d');
    }

    /**
     * ホームチームを取得
     */
    public function homeTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'home_team_id');
    }

    /**
     * アウェイチームを取得
     */
    public function awayTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'away_team_id');
    }

    /**
     * リーグを取得
     */
    public function league(): BelongsTo
    {
        return $this->belongsTo(League::class, 'league_id');
    }

    /**
     * 勝利チームを取得
     */
    public function winnerTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'winner_team_id');
    }

    /**
     * シーズンを取得
     */
    public function season(): BelongsTo
    {
        return $this->belongsTo(Season::class);
    }

    /**
     * 試合に参加した選手を取得
     */
    public function players(): BelongsToMany
    {
        return $this->belongsToMany(Player::class, 'game_players')
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

    /**
     * 試合の出場選手情報を取得
     */
    public function gamePlayers(): HasMany
    {
        return $this->hasMany(GamePlayer::class);
    }

    /**
     * 評価のある試合出場選手を取得
     */
    public function hasRatingGamePlayers(): HasMany
    {
        return $this->hasMany(GamePlayer::class)
            ->whereHas('myRating');
    }

    /**
     * 現在のユーザーの試合情報を取得
     */
    public function gameUser(): HasOne
    {
        return $this->hasOne(GameUser::class)
            ->where('user_id', Auth::id())
            ->withDefault(function (GameUser $gameUser) {
                $gameUser->user_id = Auth::id();
            });
    }

    /**
     * 試合に関連するユーザー情報を取得
     */
    public function gameUsers(): HasMany
    {
        return $this->hasMany(GameUser::class);
    }
}
