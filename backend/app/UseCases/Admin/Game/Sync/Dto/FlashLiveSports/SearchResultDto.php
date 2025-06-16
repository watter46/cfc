<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Dto\FlashLiveSports;

use App\UseCases\Admin\Game\Sync\Dto\BaseDto;
use Illuminate\Support\Collection;

/**
 * FlashLiveSports検索結果のDTOクラス
 *
 * 選手名での検索結果を保持し、複数の候補選手データを
 * Collectionとして管理します。選手の特定は呼び出し元で行います。
 *
 * Repository側から常にCollectionが渡されることを前提とした設計です。
 */
class SearchResultDto extends BaseDto
{
    /**
     * @param  Collection<int, PlayerCandidateDto>  $candidates  検索で見つかった候補選手のコレクション
     */
    public function __construct(
        public Collection $candidates,
    ) {}

    /**
     * FlashLiveSportsのAPIレスポンスからDTOを作成
     *
     * @param  Collection  $data  APIレスポンスのコレクションデータ
     */
    public static function fromCollection(Collection $data): static
    {
        if ($data->isEmpty()) {
            return new static(collect());
        }

        $candidates = $data
            ->map(fn (Collection $playerData) => PlayerCandidateDto::fromCollection($playerData))
            ->filter(fn (PlayerCandidateDto $candidate) => $candidate->isValid());

        return new static($candidates);
    }

    /**
     * 候補選手が存在するかチェック
     */
    public function hasCandidates(): bool
    {
        return $this->candidates->isNotEmpty();
    }

    /**
     * 候補選手の数を取得
     */
    public function getCandidateCount(): int
    {
        return $this->candidates->count();
    }

    /**
     * 画像を持つ候補選手のみをフィルタリング
     */
    public function getCandidatesWithImage(): Collection
    {
        return $this->candidates->filter(fn (PlayerCandidateDto $candidate) => $candidate->hasImage());
    }

    /**
     * 指定したスポーツIDの候補選手のみをフィルタリング
     */
    public function getCandidatesBySport(int $sportId): Collection
    {
        return $this->candidates->filter(fn (PlayerCandidateDto $candidate) => $candidate->sportId === $sportId);
    }
}
