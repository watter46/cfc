<?php

declare(strict_types = 1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class League extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'api_league_id',
        'name',
        'type',
        'logo_path',
    ];

    /**
     * 大会に関連する試合を取得
     */
    public function games(): HasMany
    {
        return $this->hasMany(Game::class);
    }
}
