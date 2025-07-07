<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Pagination\AbstractPaginator;
use Illuminate\Pagination\Paginator;

class ApiResourceCollection extends ResourceCollection
{
    protected string $message = '成功';

    protected bool $success = true;

    protected ?array $meta = null;

    protected ?array $errors = null;

    public function setMessage(string $message): self
    {
        $this->message = $message;

        return $this;
    }

    public function setSuccess(bool $success): self
    {
        $this->success = $success;

        return $this;
    }

    public function setMeta(array $meta): self
    {
        $this->meta = $meta;

        return $this;
    }

    public function setErrors(array $errors): self
    {
        $this->errors = $errors;
        $this->success = false;

        return $this;
    }

    public function toArray($request)
    {
        $response = [
            'success' => $this->success,
            'message' => $this->message,
            'data'    => $this->collection,
        ];

        if ($this->meta) {
            $response['meta'] = $this->meta;
        }

        if ($this->errors) {
            $response['errors'] = $this->errors;
        }

        // ページネーション情報がある場合は追加
        if ($this->resource instanceof Paginator) {
            // Simple Paginateの場合（total()やlastPage()は使用不可）
            $response['meta']['pagination'] = [
                'count'        => $this->resource->count(),
                'per_page'     => $this->resource->perPage(),
                'current_page' => $this->resource->currentPage(),
                'has_more'     => $this->resource->hasMorePages(),
                'path'         => $this->resource->path(),
            ];
        } elseif ($this->resource instanceof AbstractPaginator) {
            // 通常のPaginateの場合
            $response['meta']['pagination'] = [
                'total'        => $this->resource->total(),
                'count'        => $this->resource->count(),
                'per_page'     => $this->resource->perPage(),
                'current_page' => $this->resource->currentPage(),
                'total_pages'  => $this->resource->lastPage(),
            ];
        }

        return $response;
    }
}
