<?php

declare(strict_types=1);

namespace App\Repositories\Json;

class JsonRepository
{
    private const EXTENSION = '.json';

    private const BASE_DIR = 'database/data';

    private string $dirName;

    private int|string $fileName;

    public function get(string $dirName, int|string $fileName)
    {
        $this->dirName = $dirName;
        $this->fileName = $fileName;

        if (! $this->exist()) {
            return null;
        }

        return json_decode(file_get_contents($this->path()), true);
    }

    public function getCollection(string $dirName, int|string $fileName)
    {
        $contents = $this->get($dirName, $fileName);

        if ($contents === null) {
            return collect();
        }

        return collect($this->get($dirName, $fileName))->deepCollect();
    }

    public function exist()
    {
        return file_exists($this->path());
    }

    public function save(string $dirName, int|string $fileName, string $content)
    {
        $this->dirName = $dirName;
        $this->fileName = $fileName;

        $this->ensureDirectoryExists();

        file_put_contents($this->path(), $content);
    }

    private function path(): string
    {
        return base_path($this->getDirPath().'/'.$this->fileName.self::EXTENSION);
    }

    private function getDirPath(): string
    {
        return self::BASE_DIR.'/'.$this->dirName;
    }

    private function ensureDirectoryExists()
    {
        if (is_dir($this->getDirPath())) {
            return;
        }

        mkdir($this->getDirPath(), 0755, true);
    }
}
