<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Team extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'api_team_id',
        'name',
        'logo_path',
        'has_image',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'has_image' => 'boolean',
        ];
    }

    /**
     * チームに所属する選手を取得
     */
    public function players(): HasMany
    {
        return $this->hasMany(Player::class);
    }

    /**
     * ホームチームとして関連する試合を取得
     */
    public function homeGames(): HasMany
    {
        return $this->hasMany(Game::class, 'home_team_id');
    }

    /**
     * アウェイチームとして関連する試合を取得
     */
    public function awayGames(): HasMany
    {
        return $this->hasMany(Game::class, 'away_team_id');
    }

    /**
     * このチームをお気に入り登録しているマイクラブ
     */
    public function myClubs(): HasMany
    {
        return $this->hasMany(MyClub::class);
    }

    /**
     * チームが所属するリーグを取得
     */
    public function leagues(): BelongsToMany
    {
        return $this->belongsToMany(
            League::class,
            'games', // 中間テーブルとしてGameを使用
            'home_team_id', // TeamのIDが格納されるカラム
            'league_id', // LeagueのIDが格納されるカラム
        )->distinct(); // 重複を排除
    }
}
