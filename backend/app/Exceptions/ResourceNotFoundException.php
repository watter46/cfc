<?php

namespace App\Exceptions;

/**
 * リソースが見つからない場合のエラーを表す例外
 */
class ResourceNotFoundException extends UserFriendlyException
{
    public function __construct(string $resourceName, int $resourceId, int $code = 404)
    {
        parent::__construct('resource_not_found', ['resource' => $resourceName, 'id' => $resourceId], $code);
    }
}
