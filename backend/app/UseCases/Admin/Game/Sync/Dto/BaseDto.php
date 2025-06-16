<?php

declare(strict_types=1);

namespace App\UseCases\Admin\Game\Sync\Dto;

use Illuminate\Support\Collection;
use InvalidArgumentException;

abstract class BaseDto
{
    /**
     * DTOインスタンスを配列から作成
     *
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): static
    {
        return new static($data);
    }

    /**
     * DTOインスタンスをCollectionから作成
     *
     * @param  Collection<string, mixed>  $data
     */
    public static function fromCollection(Collection $data): static
    {
        return static::fromArray($data->toArray());
    }

    /**
     * DTOを配列に変換
     *
     * @return Collection<string, mixed>
     */
    public function toArray(): Collection
    {
        $result = [];

        foreach (get_object_vars($this) as $property => $value) {
            // 'data' プロパティは内部用のため除外
            if ($property === 'data') {
                continue;
            }

            if ($value instanceof BaseDto) {
                $result[$property] = $value->toArray();
            } elseif ($value instanceof Collection) {
                $result[$property] = $value->map(
                    fn ($item) => $item instanceof BaseDto ? $item->toArray() : $item,
                );
            } elseif (is_array($value)) {
                $result[$property] = collect($value)->map(
                    fn ($item) => $item instanceof BaseDto ? $item->toArray() : $item,
                );
            } else {
                $result[$property] = $value;
            }
        }

        return collect($result);
    }

    /**
     * DTOのプロパティをCollectionとして取得
     *
     * @return Collection<string, mixed>
     */
    public function asCollection(): Collection
    {
        return $this->toArray();
    }

    /**
     * 指定されたキーの値を取得（readonly propertyとの互換性）
     */
    public function get(string $key, mixed $default = null): mixed
    {
        // まずreadonly propertyをチェック
        if (property_exists($this, $key)) {
            return $this->$key;
        }

        // Collectionデータがある場合はそこから取得
        if (isset($this->data)) {
            return $this->data->get($key, $default);
        }

        return $default;
    }

    /**
     * 指定されたキーが存在するかチェック
     */
    public function has(string $key): bool
    {
        // まずreadonly propertyをチェック
        if (property_exists($this, $key)) {
            return true;
        }

        // Collectionデータがある場合はそこをチェック
        if (isset($this->data)) {
            return $this->data->has($key);
        }

        return false;
    }

    /**
     * DTOのデータをフィルタリング
     *
     * @return Collection<string, mixed>
     */
    public function filter(callable $callback): Collection
    {
        return $this->asCollection()->filter($callback);
    }

    /**
     * DTOのデータをマッピング
     *
     * @return Collection<string, mixed>
     */
    public function map(callable $callback): Collection
    {
        return $this->asCollection()->map($callback);
    }

    /**
     * DTOのデータをマージ
     *
     * @param  array<string, mixed>|Collection<string, mixed>  $items
     * @return Collection<string, mixed>
     */
    public function merge(array|Collection $items): Collection
    {
        $mergeData = $items instanceof Collection ? $items : collect($items);

        return $this->asCollection()->merge($mergeData);
    }

    /**
     * DTOのデータが空かチェック
     */
    public function isEmpty(): bool
    {
        return $this->asCollection()->isEmpty();
    }

    /**
     * DTOのデータが空でないかチェック
     */
    public function isNotEmpty(): bool
    {
        return $this->asCollection()->isNotEmpty();
    }

    /**
     * キーの一覧を取得
     *
     * @return Collection<int, string>
     */
    public function keys(): Collection
    {
        return $this->asCollection()->keys();
    }

    /**
     * 値の一覧を取得
     *
     * @return Collection<int, mixed>
     */
    public function values(): Collection
    {
        return $this->asCollection()->values();
    }

    /**
     * Collectionの内容をJSON形式で出力
     */
    public function toJson(): string
    {
        return $this->toArray()->toJson();
    }

    /**
     * 指定されたキーのみを含むCollection取得
     *
     * @param  array<string>  $keys
     * @return Collection<string, mixed>
     */
    public function only(array $keys): Collection
    {
        return $this->asCollection()->only($keys);
    }

    /**
     * 指定されたキーを除いたCollection取得
     *
     * @param  array<string>  $keys
     * @return Collection<string, mixed>
     */
    public function except(array $keys): Collection
    {
        return $this->asCollection()->except($keys);
    }

    /**
     * 必須フィールドの存在をチェック
     *
     * @param  array<string, mixed>|Collection<string, mixed>  $data
     * @param  array<string>  $requiredFields
     *
     * @throws InvalidArgumentException
     */
    protected static function validateRequiredFields(array|Collection $data, array $requiredFields): void
    {
        $collection = $data instanceof Collection ? $data : collect($data);

        foreach ($requiredFields as $field) {
            if (! $collection->has($field)) {
                throw new InvalidArgumentException("Required field '{$field}' is missing");
            }
        }
    }

    /**
     * 安全に配列から値を取得
     *
     * @param  array<string, mixed>  $data
     */
    protected function getValueSafely(array $data, string $key, mixed $default = null): mixed
    {
        return $data[$key] ?? $default;
    }

    /**
     * 安全にCollectionから値を取得
     *
     * @param  Collection<string, mixed>  $data
     */
    protected function getValueSafelyFromCollection(Collection $data, string $key, mixed $default = null): mixed
    {
        return $data->get($key, $default);
    }

    /**
     * 動的プロパティアクセス（readonly propertyとの互換性）
     */
    public function __get(string $name): mixed
    {
        return $this->get($name);
    }

    /**
     * 動的プロパティ存在チェック（readonly propertyとの互換性）
     */
    public function __isset(string $name): bool
    {
        return $this->has($name);
    }
}
