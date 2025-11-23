<?php

declare(strict_types=1);

namespace App\Constants;

use Illuminate\Support\Collection;
use ReflectionClass;

abstract class Constant
{
    /**
     * @return \Illuminate\Support\Collection<string, mixed>
     */
    public static function get(): Collection
    {
        return collect((new ReflectionClass(static::class))->getConstants());
    }
}
