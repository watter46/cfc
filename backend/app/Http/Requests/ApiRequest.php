<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApiRequest extends FormRequest
{
    /**
     * バリデーション対象のキーをすべて含み、未入力はnullとなる配列を返す。
     *
     * @return array{
     *     user: \App\Models\User|null,
     *     ...$params: mixed|null
     * }
     *
     * @example
     * // 返り値例
     * [
     *   'user' => Userインスタンスまたはnull,
     *   'season' => 2024,
     *   'league' => 1,
     *   'team' => null,
     *   ...
     * ]
     */
    public function inputData(): array
    {
        $validationKeys = collect($this->rules())
            ->keys()
            ->filter(fn ($key) => ! str_contains($key, '.*'))
            ->values()
            ->flip();

        $validated = collect($this->validated());

        $mapped = $validationKeys
            ->map(function ($value, $key) use ($validated) {
                $val = $validated->get($key, null);

                if (is_string($val) && is_numeric($val) && ctype_digit($val)) {
                    return (int) $val;
                }

                return $val;
            })
            ->all();

        return [
            'user' => $this->user(),
            ...$mapped,
        ];
    }
}
