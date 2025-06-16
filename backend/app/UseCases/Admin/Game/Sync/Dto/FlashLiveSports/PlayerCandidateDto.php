<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Dto\FlashLiveSports;

use App\UseCases\Admin\Game\Sync\Dto\BaseDto;
use Illuminate\Support\Str;

/**
 * FlashLiveSports検索結果の個別選手候補データDTO
 *
 * 検索で返された各選手の基本情報を保持します。
 * DBに必要なID、IMAGE、NAMEを中心とした構造です。
 */
final class PlayerCandidateDto extends BaseDto
{
    public function __construct(
        public string $id,           // FlashLiveSportsの選手ID（flash_image_idとして使用）
        public ?string $image,       // 選手画像URL（nullの場合は画像なし）
        public string $name,         // 選手名
        public int $sportId,         // スポーツID（フィルタリング用）
        public string $countryName,  // 国名（選手特定時の参考情報）
        public string $title,        // フルタイトル（チーム名含む、選手特定時の参考情報）
        public string $type,          // データタイプ（playersInTeam, participants等）
    ) {}

    /**
     * APIレスポンスの個別選手データからDTOを作成
     */
    public static function fromArray(array $data): static
    {
        return new self(
            id: $data['ID'] ?? '',
            image: $data['IMAGE'] ?? null,
            name: $data['NAME'] ?? '',
            sportId: $data['SPORT_ID'] ?? 1,
            countryName: $data['COUNTRY_NAME'] ?? '',
            title: $data['TITLE'] ?? ($data['NAME'] ?? ''),
            type: $data['TYPE'] ?? 'unknown',
        );
    }

    /**
     * 有効な選手データかどうかをチェック
     */
    public function isValid(): bool
    {
        return ! empty($this->id) && ! empty($this->name);
    }

    /**
     * 選手画像が存在するかチェック
     */
    public function hasImage(): bool
    {
        return $this->image !== null;
    }

    /**
     * サッカー選手かどうかをチェック（SPORT_ID = 1）
     */
    public function isFootballPlayer(): bool
    {
        return $this->sportId === 1;
    }

    /**
     * チーム情報を含む選手かどうかをチェック
     */
    public function hasTeamInfo(): bool
    {
        return $this->type === 'playersInTeam';
    }

    /**
     * 選手名からファーストネームとラストネームを抽出
     *
     * 例: "Sancho Jadon (Chelsea)" → "Sancho Jadon"
     */
    public function getName(): string
    {
        $cleanName = preg_replace('/\s*\([^)]*\)/', '', $this->name);

        return $cleanName;
    }

    /**
     * 選手の画像IDを取得
     *
     * 例: "https://www.flashscore.com/res/image/data/U7wcYgdM-fu87Qicm.png" → "U7wcYgdM-fu87Qicm"
     */
    public function getImageId(): ?string
    {
        if (! $this->image) {
            return null;
        }

        // URLの最後の「/」以降を取得（ファイル名＋拡張子）
        $fileNameWithExt = Str::afterLast($this->image, '/');

        // ファイル名から拡張子（.pngなど）を除去
        $imageId = Str::beforeLast($fileNameWithExt, '.');

        return $imageId;
    }

    /**
     * チーム名を抽出（括弧内の情報）
     *
     * 例: "Sancho Jadon (Chelsea)" → "Chelsea"
     */
    public function getTeamName(): ?string
    {
        if (preg_match('/\(([^)]+)\)/', $this->name, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
