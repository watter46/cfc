<?php

declare(strict_types=1);

namespace App\UseCases\Guest;

use App\Models\Game;
use App\Models\Season;
use App\UseCases\Guest\RateableService;
use Illuminate\Support\Collection;

final class FetchLatestFinishedGames
{
    private const LATEST_GAMES_LIMIT = 5;

    /**
     * FetchLatestGames constructor.
     */
    public function __construct(private RateableService $rateable) {}

    /**
     * Fetch the latest 3 finished games for the current season.
     *
     * @return Collection<Game>
     */
    public function __invoke()
    {
        return Season::current()
            ->with(['games' => function ($query) {
                $query
                    ->select([
                        'id',
                        'season_id',
                        'home_team_id',
                        'away_team_id',
                        'winner_team_id',
                        'started_at',
                        'finished_at',
                        'score',
                    ])
                    ->isEnd()
                    ->orderByDesc('started_at')
                    ->take(self::LATEST_GAMES_LIMIT);
            },
                'games.homeTeam:id,name,logo_path',
                'games.awayTeam:id,name,logo_path',
            ])
            ->firstOrFail('id')
            ->games
            ->map(function (Game $game) {
                $game->isRateable = $this->rateable->check($game);

                return $game;
            });
    }
}
