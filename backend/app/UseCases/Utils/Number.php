<?php

declare(strict_types=1);

namespace App\UseCases\Utils;

use DomainException;

final class Number
{
    private function __construct(
        public readonly int $number,
    ) {
        //
    }

    public static function create(int $number): self
    {
        if ($number < 1 || $number > 99) {
            throw new DomainException('Number is invalid');
        }

        return new self($number);
    }
}
