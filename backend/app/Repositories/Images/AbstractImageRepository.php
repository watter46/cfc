<?php

declare(strict_types=1);

namespace App\Repositories\Images;

use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

abstract class AbstractImageRepository
{
    private const LINK = 'storage';

    private const DISK = 'public';

    private const BASE_DIR = 'image';

    private const EXTENSION = '.webp';

    private string $fileName = '';

    abstract public function getDirName(): string;

    private ImageManager $manager;

    public function __construct()
    {
        $this->manager = new ImageManager(new Driver);
    }

    public function get(int|string $fileName): string
    {
        $this->setFileName($fileName);

        return Storage::disk(self::DISK)->get($this->path());
    }

    public function getFullPath(int|string $fileName): string
    {
        $this->setFileName($fileName);

        return config('app.url').'/'.$this->storagePath();
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

    public function save(int|string $fileName, string $binaryData): bool
    {
        $this->setFileName($fileName);

        $this->ensureDirectoryExists();

        $webpBinaryString = $this->manager->read($binaryData)->toWebp()->toString();

        return Storage::disk(self::DISK)->put($this->path(), $webpBinaryString);
    }

    private function path(): string
    {
        return $this->getDirPath().'/'.$this->fileName.self::EXTENSION;
    }

    private function storagePath(): string
    {
        return self::LINK.'/'.$this->getDirPath().'/'.$this->fileName.self::EXTENSION;
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
