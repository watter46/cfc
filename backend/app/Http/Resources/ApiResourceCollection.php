<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

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
        if ($this->resource->resource instanceof \Illuminate\Pagination\AbstractPaginator) {
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
