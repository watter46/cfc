<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Dto\ApiFootball;

use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\GoalsDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\LeagueDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\LineupDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\PlayerDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\ScoreDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\StatisticsDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\StatusDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\TeamDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\VenueDto;
use Illuminate\Support\Collection;

final class FixtureDetailDto
{
    /**
     * FixtureDetailDtoのコンストラクタ
     *
     * @param  Collection<LineupDto>|null  $lineups
     * @param  Collection<StatisticsDto>|null  $statistics
     * @param  Collection<PlayerDto>|null  $players
     */
    public function __construct(
        public readonly FixtureDto $fixture,
        public readonly ?Collection $lineups,
        public readonly ?Collection $statistics,
        public readonly ?Collection $players,
    ) {}

    /**
     * コレクションからDTOを作成
     *
     * @param  Collection<string, mixed>  $data
     */
    public static function fromCollection(Collection $data): static
    {
        $fixture = $data->get('fixture');
        $league = $data->get('league');
        $teams = $data->get('teams');
        $goals = $data->get('goals');
        $score = $data->get('score');

        $fixtureDto = new FixtureDto(
            id: $fixture->get('id'),
            referee: $fixture->get('referee'),
            timezone: $fixture->get('timezone'),
            date: $fixture->get('date'),
            timestamp: $fixture->get('timestamp'),
            venue: $fixture->has('venue')
                ? VenueDto::fromCollection($fixture->get('venue'))
                : null,
            status: StatusDto::fromCollection($fixture->get('status')),
            league: LeagueDto::fromCollection($league),
            homeTeam: TeamDto::fromCollection($teams->get('home')),
            awayTeam: TeamDto::fromCollection($teams->get('away')),
            goals: $goals
                ? GoalsDto::fromCollection($goals)
                : null,
            score: $score
                ? ScoreDto::fromCollection($score)
                : null,
        );

        $lineups = null;
        if ($data->has('lineups') && $data->get('lineups')->isNotEmpty()) {
            $lineups = $data->get('lineups')
                ->map(fn (Collection $lineupData) => LineupDto::fromCollection($lineupData));
        }

        $statistics = null;
        if ($data->has('statistics') && $data->get('statistics')->isNotEmpty()) {
            $statistics = $data->get('statistics')
                ->map(fn (Collection $statData) => StatisticsDto::fromCollection($statData));
        }

        $players = null;
        if ($data->has('players') && $data->get('players')->isNotEmpty()) {
            $players = $data->get('players')
                ->map(fn (Collection $playerData) => PlayerDto::fromCollection($playerData));
        }

        return new self(
            fixture: $fixtureDto,
            lineups: $lineups,
            statistics: $statistics,
            players: $players,
        );
    }

    public function getId(): int
    {
        return $this->fixture->id;
    }

    public function getReferee(): ?string
    {
        return $this->fixture->referee;
    }

    public function getTimezone(): string
    {
        return $this->fixture->timezone;
    }

    public function getDate(): string
    {
        return $this->fixture->date;
    }

    public function getTimestamp(): int
    {
        return $this->fixture->timestamp;
    }

    public function getVenue(): ?VenueDto
    {
        return $this->fixture->venue;
    }

    public function getStatus(): StatusDto
    {
        return $this->fixture->status;
    }

    public function getLeague(): LeagueDto
    {
        return $this->fixture->league;
    }

    public function getHomeTeam(): TeamDto
    {
        return $this->fixture->homeTeam;
    }

    public function getAwayTeam(): TeamDto
    {
        return $this->fixture->awayTeam;
    }

    public function getGoals(): ?GoalsDto
    {
        return $this->fixture->goals;
    }

    public function getScore(): ?ScoreDto
    {
        return $this->fixture->score;
    }

    public function isFinished(): bool
    {
        return $this->fixture->isFinished();
    }

    public function getWinnerTeam(): ?TeamDto
    {
        return $this->fixture->getWinnerTeam();
    }

    /**
     * ラインナップ情報があるかチェック
     */
    public function hasLineups(): bool
    {
        return $this->lineups !== null && $this->lineups->isNotEmpty();
    }

    /**
     * 統計情報があるかチェック
     */
    public function hasStatistics(): bool
    {
        return $this->statistics !== null && $this->statistics->isNotEmpty();
    }

    /**
     * 選手情報があるかチェック
     */
    public function hasPlayers(): bool
    {
        return $this->players !== null && $this->players->isNotEmpty();
    }

    /**
     * 指定されたチームのラインナップを取得
     */
    public function getLineupByTeam(int $teamId): ?LineupDto
    {
        if (! $this->hasLineups()) {
            return null;
        }

        return $this->lineups->first(fn (LineupDto $lineup) => $lineup->team->id === $teamId);
    }

    /**
     * ホームチームのラインナップを取得
     */
    public function getHomeLineup(): ?LineupDto
    {
        return $this->getLineupByTeam($this->getHomeTeam()->id);
    }

    /**
     * アウェイチームのラインナップを取得
     */
    public function getAwayLineup(): ?LineupDto
    {
        return $this->getLineupByTeam($this->getAwayTeam()->id);
    }

    /**
     * 指定されたチームの統計を取得
     */
    public function getStatisticsByTeam(int $teamId): ?StatisticsDto
    {
        if (! $this->hasStatistics()) {
            return null;
        }

        return $this->statistics->first(fn (StatisticsDto $stat) => $stat->team->id === $teamId);
    }

    /**
     * ホームチームの統計を取得
     */
    public function getHomeStatistics(): ?StatisticsDto
    {
        return $this->getStatisticsByTeam($this->getHomeTeam()->id);
    }

    /**
     * アウェイチームの統計を取得
     */
    public function getAwayStatistics(): ?StatisticsDto
    {
        return $this->getStatisticsByTeam($this->getAwayTeam()->id);
    }

    /**
     * 指定されたチームの選手情報を取得
     */
    public function getPlayersByTeam(int $teamId): ?PlayerDto
    {
        if (! $this->hasPlayers()) {
            return null;
        }

        return $this->players->first(fn (PlayerDto $player) => $player->team->id === $teamId);
    }

    /**
     * ホームチームの選手情報を取得
     */
    public function getHomePlayers(): ?PlayerDto
    {
        return $this->getPlayersByTeam($this->getHomeTeam()->id);
    }

    /**
     * アウェイチームの選手情報を取得
     */
    public function getAwayPlayers(): ?PlayerDto
    {
        return $this->getPlayersByTeam($this->getAwayTeam()->id);
    }

    /**
     * 詳細データが完全に取得されているかチェック
     */
    public function isDetailComplete(): bool
    {
        return $this->hasLineups() && $this->hasStatistics() && $this->hasPlayers();
    }

    /**
     * 配列変換
     *
     * @return Collection<string, mixed>
     */
    public function toArray(): Collection
    {
        $baseArray = $this->fixture->toArray();

        return collect($baseArray)->merge([
            'lineups'    => $this->lineups?->map(fn (LineupDto $lineup) => $lineup->toArray()),
            'statistics' => $this->statistics?->map(fn (StatisticsDto $stat) => $stat->toArray()),
            'players'    => $this->players?->map(fn (PlayerDto $player) => $player->toArray()),
        ]);
    }
}
