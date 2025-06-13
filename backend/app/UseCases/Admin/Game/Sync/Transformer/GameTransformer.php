<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Transformer;

use App\Models\Game;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureDetailDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureDto;
use App\UseCases\Admin\Game\Sync\Dto\ApiFootball\FixtureListDto;
use App\UseCases\Admin\Game\Sync\Service\GameDataFilterService;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Collection;

final class GameTransformer
{
    /**
     * 試合終了推定時間（分）
     */
    private const ESTIMATED_GAME_DURATION_MINUTES = 115;

    /**
     * SyncGamesAction用: FixtureListDtoからUpsert用のデータ配列を構築
     */
    public function toUpsertData(FixtureListDto $fixturesListDto, Collection $relationIds): array
    {
        $teamMapping = $relationIds->get('teamMapping');
        $leagueMapping = $relationIds->get('leagueMapping');
        $seasonMapping = $relationIds->get('seasonMapping');

        return $fixturesListDto->fixtures
            ->map(function ($fixture) use ($teamMapping, $leagueMapping, $seasonMapping) {
                $startedAt = $this->parseDateTime($fixture->date);
                $finishedAt = $this->calculateFinishedAt($fixture, $startedAt);
                $winnerTeamId = $this->resolveWinnerTeamId($fixture, $teamMapping);

                return [
                    'api_fixture_id'     => $fixture->id,
                    'home_team_id'       => $teamMapping->get($fixture->homeTeam->id),
                    'away_team_id'       => $teamMapping->get($fixture->awayTeam->id),
                    'winner_team_id'     => $winnerTeamId,
                    'league_id'          => $leagueMapping->get($fixture->league->id),
                    'season_id'          => $seasonMapping->get($fixture->league->season),
                    'score'              => $this->buildScoreJson($fixture),
                    'is_end'             => $fixture->isFinished(),
                    'is_details_fetched' => false,
                    'started_at'         => $startedAt,
                    'finished_at'        => $finishedAt,
                    'updated_at'         => Carbon::now(),
                ];
            })
            ->filter(
                fn ($game) => ! is_null($game['home_team_id']) &&
                ! is_null($game['away_team_id']) &&
                ! is_null($game['league_id']) &&
                ! is_null($game['season_id']),
            )
            ->values()
            ->toArray();
    }

    /**
     * SyncGameDetailAction用: GameモデルとFixtureDetailDtoから単体ゲームデータを構築
     *
     * @return array<string, mixed>
     */
    public function toUpdateData(Game $game, GameDataFilterService $service): array
    {
        return [
            'winner_team_id'     => $this->resolveWinnerTeamId($service->getFixture(), $game),
            'score'              => $this->buildScoreJson($service->getFixture()),
            'is_end'             => true,
            'is_details_fetched' => true,
        ];
    }

    /**
     * 日時文字列をCarbonインスタンスに変換
     */
    private function parseDateTime(?string $dateTime): ?Carbon
    {
        if (! $dateTime) {
            return null;
        }

        try {
            return Carbon::parse($dateTime);
        } catch (Exception) {
            return null;
        }
    }

    /**
     * 試合終了時刻を計算
     */
    private function calculateFinishedAt($fixture, ?Carbon $startedAt): ?Carbon
    {
        if (! $fixture->isFinished() || ! $startedAt) {
            return null;
        }

        return $startedAt->copy()->addMinutes(self::ESTIMATED_GAME_DURATION_MINUTES);
    }

    /**
     * 勝利team_idを取得する
     */
    private function resolveWinnerTeamId(FixtureDto $dto, Game $game): ?int
    {
        $teamIdMapping = collect([
            $game->homeTeam->api_team_id => $game->homeTeam->id,
            $game->awayTeam->api_team_id => $game->awayTeam->id,
        ]);

        $winner = $dto->getWinnerTeam();

        if (! $winner) {
            return null;
        }

        return $teamIdMapping->get($winner->id);
    }

    /**
     * スコアJSONを構築
     *
     * @param  FixtureDto|FixtureDetailDto  $fixture
     */
    private function buildScoreJson($fixture): ?string
    {
        $goals = $fixture instanceof FixtureDetailDto ? $fixture->getGoals() : $fixture->goals;
        $score = $fixture instanceof FixtureDetailDto ? $fixture->getScore() : $fixture->score;

        if (! $goals) {
            return null;
        }

        $scoreData = [
            'home' => $goals->home,
            'away' => $goals->away,
        ];

        // より詳細なスコア情報があれば追加
        if ($score) {
            $scoreData['halftime'] = [
                'home' => $score->halftime?->home,
                'away' => $score->halftime?->away,
            ];
            $scoreData['fulltime'] = [
                'home' => $score->fulltime?->home,
                'away' => $score->fulltime?->away,
            ];

            if ($score->extratime) {
                $scoreData['extratime'] = [
                    'home' => $score->extratime->home,
                    'away' => $score->extratime->away,
                ];
            }

            if ($score->penalty) {
                $scoreData['penalty'] = [
                    'home' => $score->penalty->home,
                    'away' => $score->penalty->away,
                ];
            }
        }

        return json_encode($scoreData);
    }
}
