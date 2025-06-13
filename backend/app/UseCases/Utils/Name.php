<?php

declare(strict_types=1);

namespace App\UseCases\Utils;

use Illuminate\Support\Str;

final readonly class Name
{
    public function __construct(
        private string $firstName,
        private string $firstNamePlain,
        private ?string $lastName = null,
        private ?string $lastNamePlain = null,
    ) {
        //
    }

    public static function create(string $name): self
    {
        $first = Str::of($name)->explode(' ')->first();
        $last = Str::of($name)->explode(' ')->last();

        $firstPlain = Str::ascii($first);
        $lastPlain = $first !== $last ? Str::ascii($last) : null;

        return new self(
            $first,
            $firstPlain,
            $last,
            $lastPlain,
        );
    }

    public function equalsFullName(Name $name)
    {
        return $this->getFullNamePlain() === $name->getFullNamePlain();
    }

    public function equalsShortenName(Name $name)
    {
        return $this->getShortenNamePlain() === $name->getShortenNamePlain();
    }

    public function equalsLastName(Name $name)
    {
        return $this->getLastNamePlain() === $name->getLastNamePlain();
    }

    public function swap(): self
    {
        if (! $this->lastName) {
            return $this;
        }

        return new self(
            $this->lastName,
            $this->lastNamePlain,
            $this->firstName,
            $this->firstNamePlain,
        );
    }

    public function isShorten(): bool
    {
        return preg_match('/^[A-Z]\.$/', $this->getFirstName()) === 1;
    }

    public function equal(Name $name)
    {
        $equal = $this->equalsFullName($name) || $this->equalsShortenName($name);

        if ($equal) {
            return true;
        }

        $swapName = $name->swap();

        return $this->equalsFullName($swapName) || $this->equalsShortenName($swapName);
    }

    public function getFullName(): string
    {
        if (! $this->lastName) {
            return $this->getFirstName();
        }

        return $this->getFirstName().' '.$this->getLastName();
    }

    public function getShortenName(): string
    {
        if (! $this->lastName) {
            return $this->getFirstName();
        }

        $shortenFirstName = Str::substr($this->getFirstName(), 0, 1);

        return $shortenFirstName.'. '.$this->getLastName();
    }

    public function getFullNamePlain(): string
    {
        if (! $this->lastNamePlain) {
            return $this->getFirstNamePlain();
        }

        return $this->getFirstNamePlain().' '.$this->getLastNamePlain();
    }

    public function getShortenNamePlain(): string
    {
        if (! $this->lastNamePlain) {
            return $this->getFirstNamePlain();
        }

        $shortenFirstNamePlain = Str::substr($this->getFirstNamePlain(), 0, 1);

        return $shortenFirstNamePlain.'. '.$this->getLastNamePlain();
    }

    private function getFirstName(): string
    {
        return $this->firstName;
    }

    private function getLastName(): ?string
    {
        return $this->lastName;
    }

    private function getFirstNamePlain(): string
    {
        return $this->firstNamePlain;
    }

    private function getLastNamePlain(): ?string
    {
        return $this->lastNamePlain;
    }
}
