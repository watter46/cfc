<?php

declare(strict_types = 1);

namespace App\Repositories\Json;

use App\Models\Game;
use App\Models\GamePlayer;
use App\Models\League;
use App\Models\Player;
use App\Models\PlayerStatistic;
use App\Models\Season;
use App\Models\Team;
use Illuminate\Support\Collection;

class TenGamesJsonRepository extends JsonRepository
{
    private const FIXTURE_ID_LIST = [
        1208074,
        1299304,
        1208085,
        1208094,
        1299319,
        1208107,
        1310475,
        1208117,
        1299338,
        1208125,
    ];

    private Collection $gameIds;

    private Collection $gamePlayerIds;

    public function saveAll()
    {
        $this->saveGames();
        $this->saveSeason();
        $this->saveLeague();
        $this->saveTeams();
        $this->savePlayers();
        $this->saveGamePlayers();
        $this->savePlayerStatistics();
    }

    public function getGames()
    {
        return collect($this->get('test/ten_games', 'games'))
            ->deepCollect()
            ->map(function ($game) {
                return $game->map(function ($column, $key) {
                    if ($key === 'score') {
                        return json_encode($column);
                    }

                    return $column;
                });
            })
            ->toArray();
    }

    public function getSeasons()
    {
        return $this->get('test/ten_games', 'seasons');
    }

    public function getLeagues()
    {
        return $this->get('test/ten_games', 'leagues');
    }

    public function getTeams()
    {
        return $this->get('test/ten_games', 'teams');
    }

    private function saveGames()
    {
        $games = $this->excludeDateTime(Game::whereIn('api_fixture_id', self::FIXTURE_ID_LIST)->get());

        $this->gameIds = $games->pluck('id');

        $content = $games->toJson();

        $this->save('test/ten_games', 'games', $content);
    }

    private function saveSeason()
    {
        $season = $this->excludeDateTime(Season::get());

        $content = $season->toJson();

        $this->save('test/ten_games', 'seasons', $content);
    }

    private function saveLeague()
    {
        $league = $this->excludeDateTime(League::get());

        $content = $league->toJson();

        $this->save('test/ten_games', 'leagues', $content);
    }

    private function saveTeams()
    {
        $teams = $this->excludeDateTime(Team::get());

        $content = $teams->toJson();

        $this->save('test/ten_games', 'teams', $content);
    }

    private function savePlayers()
    {
        $players = $this->excludeDateTime(Player::get());

        $content = $players->toJson();

        $this->save('test/ten_games', 'players', $content);
    }

    private function saveGamePlayers()
    {
        $gamePlayers = $this->excludeDateTime(GamePlayer::whereIn('game_id', $this->gameIds->toArray())->get());

        $this->gamePlayerIds = $gamePlayers->pluck('id');

        $content = $gamePlayers->toJson();

        $this->save('test/ten_games', 'game_players', $content);
    }

    private function savePlayerStatistics()
    {
        $playerStatistics = $this->excludeDateTime(PlayerStatistic::whereIn('game_player_id', $this->gamePlayerIds->toArray())->get());

        $content = $playerStatistics->toJson();

        $this->save('test/ten_games', 'player_statistics', $content);
    }

    private function excludeDateTime(Collection $collection)
    {
        return $collection->map(function ($item) {
            if (isset($item['created_at'])) {
                unset($item['created_at']);
            }
            if (isset($item['updated_at'])) {
                unset($item['updated_at']);
            }

            return $item;
        });
    }
}
