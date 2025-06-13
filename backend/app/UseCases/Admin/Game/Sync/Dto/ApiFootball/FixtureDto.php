<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Dto\ApiFootball;

use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\GoalsDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\LeagueDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\ScoreDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\StatusDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\TeamDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\Components\VenueDto;
use App\UseCases\Admin\Game\Sync\Dto\BaseDto;
use Illuminate\Support\Collection;

final class FixtureDto extends BaseDto
{
    public function __construct(
        public readonly int $id,
        public readonly ?string $referee,
        public readonly string $timezone,
        public readonly string $date,
        public readonly int $timestamp,
        public readonly ?VenueDto $venue,
        public readonly StatusDto $status,
        public readonly LeagueDto $league,
        public readonly TeamDto $homeTeam,
        public readonly TeamDto $awayTeam,
        public readonly ?GoalsDto $goals,
        public readonly ?ScoreDto $score,
    ) {}

    /**
     * 配列からDTOを作成
     *
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): static
    {
        self::validateRequiredFields($data, ['fixture', 'league', 'teams']);

        return new self(
            id: $data['fixture']['id'],
            referee: $data['fixture']['referee'] ?? null,
            timezone: $data['fixture']['timezone'],
            date: $data['fixture']['date'],
            timestamp: $data['fixture']['timestamp'],
            venue: isset($data['fixture']['venue'])
                ? VenueDto::fromArray($data['fixture']['venue'])
                : null,
            status: StatusDto::fromArray($data['fixture']['status']),
            league: LeagueDto::fromArray($data['league']),
            homeTeam: TeamDto::fromArray($data['teams']['home']),
            awayTeam: TeamDto::fromArray($data['teams']['away']),
            goals: isset($data['goals'])
                ? GoalsDto::fromArray($data['goals'])
                : null,
            score: isset($data['score'])
                ? ScoreDto::fromArray($data['score'])
                : null,
        );
    }

    /**
     * CollectionからDTOを作成
     */
    public static function fromCollection(Collection $data): static
    {
        static::validateRequiredFields($data->toArray(), ['fixture', 'league', 'teams']);

        $fixture = $data->get('fixture');
        $league = $data->get('league');
        $teams = $data->get('teams');
        $goals = $data->get('goals');
        $score = $data->get('score');

        return new static(
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
    }

    /**
     * 試合が完了しているかチェック
     */
    public function isFinished(): bool
    {
        return in_array($this->status->short, ['FT', 'AET', 'PEN'], true);
    }

    /**
     * 試合が予定されているかチェック
     */
    public function isScheduled(): bool
    {
        return in_array($this->status->short, ['TBD', 'NS'], true);
    }

    /**
     * 試合がライブ中かチェック
     */
    public function isLive(): bool
    {
        return in_array($this->status->short, ['1H', '2H', 'HT', 'ET', 'BT', 'P'], true);
    }

    /**
     * 試合がキャンセルされているかチェック
     */
    public function isCancelled(): bool
    {
        return in_array($this->status->short, ['CANC', 'SUSP', 'PST', 'ABD'], true);
    }

    /**
     * 勝者チームを取得
     */
    public function getWinnerTeam(): ?TeamDto
    {
        if (! $this->isFinished() || ! $this->goals) {
            return null;
        }

        $homeGoals = $this->goals->home ?? 0;
        $awayGoals = $this->goals->away ?? 0;

        if ($homeGoals > $awayGoals) {
            return $this->homeTeam;
        } elseif ($awayGoals > $homeGoals) {
            return $this->awayTeam;
        }

        return null; // 引き分け
    }

    /**
     * ホームチームが勝利したかチェック
     */
    public function isHomeWin(): bool
    {
        $winner = $this->getWinnerTeam();

        return $winner && $winner->id === $this->homeTeam->id;
    }

    /**
     * アウェイチームが勝利したかチェック
     */
    public function isAwayWin(): bool
    {
        $winner = $this->getWinnerTeam();

        return $winner && $winner->id === $this->awayTeam->id;
    }

    /**
     * 引き分けかチェック
     */
    public function isDraw(): bool
    {
        return $this->isFinished() && $this->getWinnerTeam() === null;
    }

    /**
     * 指定されたチームが参加している試合かチェック
     */
    public function hasTeam(int $teamId): bool
    {
        return $this->homeTeam->id === $teamId || $this->awayTeam->id === $teamId;
    }

    /**
     * 指定されたチームのホーム試合かチェック
     */
    public function isHomeGameFor(int $teamId): bool
    {
        return $this->homeTeam->id === $teamId;
    }

    /**
     * 指定されたチームのアウェイ試合かチェック
     */
    public function isAwayGameFor(int $teamId): bool
    {
        return $this->awayTeam->id === $teamId;
    }

    /**
     * 配列変換
     *
     * @return Collection<string, mixed>
     */
    public function toArray(): Collection
    {
        return collect([
            'id'        => $this->id,
            'referee'   => $this->referee,
            'timezone'  => $this->timezone,
            'date'      => $this->date,
            'timestamp' => $this->timestamp,
            'venue'     => $this->venue?->toArray(),
            'status'    => $this->status->toArray(),
            'league'    => $this->league->toArray(),
            'home_team' => $this->homeTeam->toArray(),
            'away_team' => $this->awayTeam->toArray(),
            'goals'     => $this->goals?->toArray(),
            'score'     => $this->score?->toArray(),
        ]);
    }
}
