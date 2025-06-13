<?php

declare(strict_types=1);

namespace App\Repositories\Images;

use Illuminate\Support\Facades\Storage;

abstract class AbstractImageRepository
{
    private const LINK = 'storage';

    private const DISK = 'public';

    private const BASE_DIR = 'image';

    private string $fileName = '';

    abstract public function getDirName(): string;

    public function getFullPath(int|string $fileName): string
    {
        $this->setFileName($fileName);

        return $this->path();
    }

    public function files()
    {
        return Storage::disk(self::DISK)->files($this->getDirPath());
    }

    public function exist(int|string $fileName)
    {
        $this->setFileName($fileName);

        return Storage::disk(self::DISK)->exists($this->path());
    }

    public function save(int|string $fileName, string $image)
    {
        $this->setFileName($fileName);

        $this->ensureDirectoryExists();

        Storage::disk(self::DISK)->put($this->path(), $image);
    }

    private function path(): string
    {
        return self::LINK.'/'.$this->getDirPath().'/'.$this->fileName;
    }

    private function getDirPath(): string
    {
        return self::BASE_DIR.'/'.$this->getDirName();
    }

    private function ensureDirectoryExists()
    {
        if (Storage::disk(self::DISK)->exists($this->getDirPath())) {
            return;
        }

        Storage::disk(self::DISK)->makeDirectory($this->getDirPath());
    }

    private function setFileName(int|string $fileName): void
    {
        $this->fileName = "$fileName";
    }
}
