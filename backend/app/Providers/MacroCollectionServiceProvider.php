<?php

declare(strict_types = 1);

namespace App\Providers;

use Illuminate\Support\Collection;
use Illuminate\Support\ServiceProvider;
use InvalidArgumentException;

/**
 * @mixin \Illuminate\Support\Collection
 */
class MacroCollectionServiceProvider extends ServiceProvider
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
            $processed = new \SplObjectStorage();

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
        Collection::macro('getDotRaw', function (string $key) {
            return data_get($this, $key);
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

        /*
        * コレクション内の指定キーを変換マップに基づいて置き換えます。
        *
        * @param Collection<int|string, mixed> $replacements 変換マップ（キー: 元のID、値: 置き換え後の値）
        * @param string[] $targetKeys 変換対象とするキー名の配列（'team_id' や 'user_id' など）
        * @param string[] $nullableKeys nullの許可されたキー名（デフォルトは空配列）
        *
        * @return Collection 置き換え後のコレクション
        *
        * @throws \InvalidArgumentException 対象キーが存在しない場合や、nullが許可されていない場合など
        */
        Collection::macro('replaceKeysFromMap', function (
            Collection $replacements,
            array $targetKeys,
            array $nullableKeys = []
        ) {
            $replace = function ($item) use (&$replace, $replacements, $targetKeys, $nullableKeys) {
                if ($item instanceof Collection) {
                    return $item->map($replace);
                }
                if (is_array($item)) {
                    $item = collect($item)->map($replace)->all();
                }
                if (is_array($item)) {
                    foreach ($targetKeys as $key) {
                        if (! array_key_exists($key, $item)) {
                            throw new \InvalidArgumentException("キー '{$key}' が存在しません。");
                        }
                        $value = $item[$key];
                        if (is_null($value)) {
                            if (! in_array($key, $nullableKeys, true)) {
                                throw new \InvalidArgumentException("キー '{$key}' に null は許可されていません。");
                            }

                            continue;
                        }
                        if (! $replacements->has($value)) {
                            throw new \InvalidArgumentException("変換マップに存在しないID '{$value}' が指定されました（キー: {$key}）。");
                        }
                        $item[$key] = $replacements[$value];
                    }
                }

                return $item;
            };

            return $this->map($replace);
        });
    }
}
