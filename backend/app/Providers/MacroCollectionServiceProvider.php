<?php

declare(strict_types=1);

namespace App\Providers;

use ArrayAccess;
use Illuminate\Support\Collection;
use Illuminate\Support\ServiceProvider;
use InvalidArgumentException;
use SplObjectStorage;

/**
 * @mixin \Illuminate\Support\Collection
 */
final class MacroCollectionServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        /*
         * 配列を再帰的にコレクションに変換する
         * どの階層でもコレクションのメソッドを使用可能にする
         */
        Collection::macro('deepCollect', function () {
            $processed = new SplObjectStorage;

            $wrap = function ($value) use (&$wrap, &$processed) {
                if (is_array($value)) {
                    return collect($value)->map($wrap);
                }

                if ($value instanceof Collection) {
                    if ($processed->contains($value)) {
                        return $value; // 再帰停止
                    }
                    $processed->attach($value);

                    return $value->map($wrap);
                }

                return $value;
            };

            return $wrap($this);
        });

        /*
         * ドット記法を使用してネストされたプロパティにアクセスし、
         * 結果を再帰的にコレクションに変換する
         */
        Collection::macro('getDot', function (string $key) {
            $data = $this->all();

            return collect(data_get($data, $key))->deepCollect();
        });

        /*
         * ドット記法を使用してネストされたプロパティにアクセスし、
         * 元の値をそのまま返す
         */
        Collection::macro('getDotRaw', function (string $key, mixed $default = null) {
            return data_get($this, $key) ?? $default;
        });

        /*
         * ドット記法を使用してネストされたプロパティに値を設定する
         */
        Collection::macro('setDot', function (string $key, $value) {
            $data = $this->all();

            return collect(data_set($data, $key, $value));
        });

        /*
         * 標準オブジェクトをコレクションに変換する
         */
        Collection::macro('fromStd', function () {
            // オブジェクトまたは文字列をコレクションに変換
            if (is_string($this)) {
                return collect(json_decode($this, true));
            }

            // すでにオブジェクトの場合は連想配列に変換
            return collect(json_decode(json_encode($this), true));
        });

        // 後方互換性のためのエイリアス
        Collection::macro('recursiveCollect', function () {
            return $this->deepCollect();
        });

        /*
         * 指定されたキーでグループ化し、それらのグループをマージする
         *
         * @param string $key グループ化に使用するキー
         * @param Collection ...$collections マージするコレクション
         * @return Collection マージされたグループ化されたコレクション
         */
        Collection::macro('groupMergeBy', function (string $key, Collection ...$collections): Collection {
            $all = $this->concat(collect($collections)->flatten(1));

            return $all
                ->groupBy(function ($item) use ($key) {
                    if (! $item instanceof Collection) {
                        $item = collect($item);
                    }

                    if (! $item->has($key)) {
                        throw new InvalidArgumentException("Key '{$key}' is missing in one or more items.");
                    }

                    return $item->get($key);
                })
                ->map(function (Collection $group) {
                    return $group->reduce(function ($carry, $item) {
                        return $carry->merge($item);
                    }, collect());
                })
                ->values();
        });

        /**
         * 指定したキーの値をマッピングデータに基づいて置換するマクロ
         * コレクションを含む値でも正しく変換できるよう再帰処理を強化
         *
         * @param  Collection  $replacements  キー変換マップ（元の値 => 置換後の値）
         * @param  array  $targetKeys  変換対象のキー名配列
         * @param  array  $nullableKeys  null値を許容するキー名配列
         * @return Collection 変換後のコレクション
         *
         * @throws InvalidArgumentException 変換エラー時
         */
        Collection::macro('replaceKeysFromMap', function (
            Collection $replacements,
            array $targetKeys,
            array $nullableKeys = [],
        ): Collection {
            $replace = function ($item) use (&$replace, $replacements, $targetKeys, $nullableKeys) {
                // 配列またはコレクションなら再帰的に処理
                if (is_array($item) || $item instanceof Collection || $item instanceof ArrayAccess) {
                    $result = $item instanceof Collection ? collect([]) : [];

                    foreach ($item as $key => $value) {
                        // コレクションの場合はコレクションのまま再帰処理
                        if ($value instanceof Collection) {
                            $result[$key] = $replace($value);
                        }
                        // 配列の場合は再帰処理
                        elseif (is_array($value)) {
                            $result[$key] = $replace($value);
                        }
                        // 対象キーの場合はマッピングで置換
                        elseif (in_array($key, $targetKeys, true)) {
                            // null値チェック
                            if ($value === null) {
                                if (! in_array($key, $nullableKeys, true)) {
                                    throw new InvalidArgumentException("キー '{$key}' に null は許可されていません。");
                                }
                                $result[$key] = null;
                            } else {
                                // 置換処理
                                if (! $replacements->has($value)) {
                                    throw new InvalidArgumentException("変換マップに存在しないID '{$value}' が指定されました（キー: {$key}）。");
                                }
                                $result[$key] = $replacements->get($value);
                            }
                        } else {
                            // 対象外のキーはそのまま
                            $result[$key] = $value;
                        }
                    }

                    // 元の型を維持
                    return $item instanceof Collection ? collect($result) : $result;
                }

                return $item;
            };

            return $this->map($replace);
        });

        /**
         * 指定したキーのみを抽出し任意のキー名にマップ（ネスト構造維持）
         *
         * ネストしたコレクションから特定のキーのみを取得し、
         * 任意のキー名でマッピングしながらネスト構造を維持します。
         *
         * @param  array  $keyMap  マッピング定義配列（新キー => 元キーパス）
         * @return Collection 指定キーのみを含む新しいコレクション
         */
        Collection::macro('mapOnly', function (array $keyMap): Collection {
            return $this->map(function ($item) use ($keyMap) {
                $result = [];

                foreach ($keyMap as $newKey => $dotKey) {
                    // 数値インデックスの場合は元のキーを使用（従来の互換性）
                    if (is_numeric($newKey)) {
                        // 元の mapOnly 機能をそのまま維持
                        $value = data_get($item, $dotKey);

                        // ネスト構造を維持してセット
                        data_set($result, $dotKey, $value);
                    } else {
                        // キー名変更の場合：値を取得して新しいキーパスにセット
                        $value = data_get($item, $dotKey);

                        // 新しいキー名でネスト構造を維持
                        data_set($result, $newKey, $value);
                    }
                }

                return $result;
            });
        });

        /**
         * 指定したキーのみを抽出（フラットな構造で任意のキー名を指定）
         *
         * ネスト構造を維持せず、フラットな配列として返します。
         * キー名も自由に指定できるため、フロントエンド向けの
         * カスタマイズされたデータ構造を簡単に作成できます。
         *
         * @param  array  $keyMap  抽出するキーのマップ（新しいキー名 => ドット記法のキー）
         * @return Collection フラットな構造の新しいコレクション
         */
        Collection::macro('mapOnlyFlat', function (array $keyMap): Collection {
            return $this->map(function ($item) use ($keyMap) {
                $result = [];

                foreach ($keyMap as $newKey => $dotKey) {
                    // 数値インデックスの場合は元のキーをそのまま使用
                    if (is_numeric($newKey)) {
                        $finalKey = str_replace('.', '_', $dotKey);
                    } else {
                        $finalKey = $newKey;
                    }

                    $result[$finalKey] = data_get($item, $dotKey);
                }

                return $result;
            });
        });

        /**
         * コレクションの値をインクリメントするマクロメソッド
         *
         * 統計カウンター処理で頻繁に使用するインクリメント操作を
         * より直感的で読みやすい形で実現します。
         */
        Collection::macro('increment', function (string $key, int $amount = 1) {
            /** @var Collection $this */
            $currentValue = $this->get($key, 0);
            $this->put($key, $currentValue + $amount);

            return $this;
        });
    }
}
