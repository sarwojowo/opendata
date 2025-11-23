<?php

declare(strict_types=1);

namespace App\Enums;

enum RoleEnum: string
{
    use EnumTrait;

    case SuperAdmin = 'super_admin';
    case Admin = 'admin';
    case User = 'user';

    public function translated(): string
    {
        return match ($this->value) {
            self::User->value => 'User',
            self::SuperAdmin->value => 'Admin Pusat',
            self::Admin->value => 'Admin Satker',
            default => $this->name,
        };
    }
}
