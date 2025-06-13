<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Dto\ApiFootball;

use App\UseCases\Admin\Game\Sync\Dto\BaseDto;
use Illuminate\Support\Collection;

final class FixtureListDto extends BaseDto
{
    /**
     * @param  Collection<FixtureDto>  $fixtures
     */
    public function __construct(
        public readonly Collection $fixtures,
    ) {}

    /**
     * APIレスポンスからDTOを作成
     * APIレスポンスは試合データのCollectionが直接渡される
     *
     * @param  Collection  $fixturesData  試合データのCollection
     */
    public static function fromApiResponse(Collection $fixturesData): static
    {
        $fixtures = $fixturesData->map(fn (Collection $fixtureData) => FixtureDto::fromCollection($fixtureData));

        return new self(
            fixtures: $fixtures,
        );
    }

    /**
     * 完了した試合を取得
     *
     * @return Collection<FixtureDto>
     */
    public function getFinishedFixtures(): Collection
    {
        return $this->fixtures->filter(fn (FixtureDto $fixture) => $fixture->isFinished());
    }

    /**
     * 全チームのAPIチームIDを取得
     *
     * @return Collection<int>
     */
    public function apiTeamIds(): Collection
    {
        return $this->fixtures
            ->flatMap(fn (FixtureDto $fixture) => [$fixture->homeTeam->id, $fixture->awayTeam->id])
            ->unique()
            ->values();
    }

    /**
     * 全リーグのAPIリーグIDを取得
     *
     * @return Collection<int>
     */
    public function apiLeagueIds(): Collection
    {
        return $this->fixtures
            ->pluck('league.id')
            ->unique()
            ->values();
    }

    /**
     * ユニークなシーズン年度を取得
     *
     * @return Collection<int>
     */
    public function getUniqueSeasonYears(): Collection
    {
        return $this->fixtures
            ->pluck('league.season')
            ->unique()
            ->values();
    }

    /**
     * 配列変換
     *
     * @return Collection<string, mixed>
     */
    public function toArray(): Collection
    {
        return collect([
            'fixtures' => $this->fixtures->map(fn (FixtureDto $fixture) => $fixture->toArray()),
        ]);
    }
}
