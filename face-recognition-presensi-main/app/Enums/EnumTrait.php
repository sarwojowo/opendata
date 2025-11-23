<?php

declare(strict_types=1);

namespace App\Enums;

use Illuminate\Support\Collection;

trait EnumTrait
{
    public static function toAssociativeArray(): array
    {
        foreach (self::cases() as $case) {
            $array[$case->name] = $case->value;
        }

        return $array;
    }

    public static function toArray(): array
    {
        return array_values(self::toAssociativeArray());
    }

    public static function getCollection(): Collection
    {
        return collect(self::toArray());
    }

    public static function getEnumCollection(): Collection
    {
        return collect(self::cases());
    }

    public static function fromName(string $name)
    {
        return constant("static::$name");
    }

    public static function fromValue(mixed $value): ?self
    {
        foreach (self::cases() as $case) {
            if ($case->value === $value) {
                return $case;
            }
        }

        return null;
    }

    public static function toOptions(): Collection
    {
        return collect(self::cases())->map(static fn ($case) => [
            'name' => $case->name,
            'value' => $case->value,
            'label' => $case->translated(),
        ]);
    }

    public function translated(): string
    {
        return __($this->value);
    }
}
