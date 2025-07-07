<?php

declare(strict_types=1);

namespace App\Repositories\Json;

use App\Models\Game;
use App\Models\GamePlayer;
use App\Models\League;
use App\Models\Player;
use App\Models\PlayerStatistic;
use App\Models\Season;
use App\Models\Team;
use Illuminate\Support\Collection;

final class InsertJsonRepository extends JsonRepository
{
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
        return collect($this->get('insert', 'games'))
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
        return $this->get('insert', 'seasons');
    }

    public function getLeagues()
    {
        return $this->get('insert', 'leagues');
    }

    public function getTeams()
    {
        return $this->get('insert', 'teams');
    }

    public function getPlayers()
    {
        return $this->get('insert', 'players');
    }

    public function getGamePlayers()
    {
        return $this->get('insert', 'game_players');
    }

    public function getPlayerStatistics()
    {
        return $this->get('insert', 'player_statistics');
    }

    public function getMyClubs()
    {
        return $this->get('insert', 'my_clubs');
    }

    public function getUsers()
    {
        return $this->get('insert', 'users');
    }

    public function getPersonalAccessTokens()
    {
        return $this->get('insert', 'personal_access_tokens');
    }

    private function saveSeason()
    {
        $season = $this->excludeDateTime(Season::get());

        $content = $season->toJson();

        $this->save('insert', 'seasons', $content);
    }

    private function saveGames()
    {
        $games = $this->excludeDateTime(Game::get());

        $content = $games->toJson();

        $this->save('insert', 'games', $content);
    }

    private function saveLeague()
    {
        $league = $this->excludeDateTime(League::get());

        $content = $league->toJson();

        $this->save('insert', 'leagues', $content);
    }

    private function saveTeams()
    {
        $teams = $this->excludeDateTime(Team::get());

        $content = $teams->toJson();

        $this->save('insert', 'teams', $content);
    }

    private function savePlayers()
    {
        $players = $this->excludeDateTime(Player::get());

        $content = $players->toJson();

        $this->save('insert', 'players', $content);
    }

    private function saveGamePlayers()
    {
        $gamePlayers = $this->excludeDateTime(GamePlayer::get());

        $content = $gamePlayers->toJson();

        $this->save('insert', 'game_players', $content);
    }

    private function savePlayerStatistics()
    {
        $playerStatistics = $this->excludeDateTime(PlayerStatistic::get());

        $content = $playerStatistics->toJson();

        $this->save('insert', 'player_statistics', $content);
    }

    private function saveMyClubs()
    {
        $myClubs = $this->excludeDateTime($this->getMyClubs());

        $content = $myClubs->toJson();

        $this->save('insert', 'my_clubs', $content);
    }

    private function saveUsers()
    {
        $users = $this->excludeDateTime($this->getUsers());

        $content = $users->toJson();

        $this->save('insert', 'users', $content);
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
