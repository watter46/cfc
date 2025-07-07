<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class MyClub extends Model
{
    protected $fillable = [
        'user_id',
        'team_id',
        'is_primary',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    /**
     * このお気に入りの所有ユーザー
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * お気に入りのチーム
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }
}
