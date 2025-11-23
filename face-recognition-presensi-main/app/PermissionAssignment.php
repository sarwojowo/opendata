<?php

declare(strict_types=1);

namespace App;

use App\Constants\PermissionConstant as P;
use App\Enums\RoleEnum as R;

class PermissionAssignment
{
    /**
     * @return array<string, string[]>
     */
    public static function assignments(): array // NOSONAR
    {
        return [
            P::VIEW_HORIZON_DASHBOARD => [R::SuperAdmin],
            P::VIEW_ADMIN_DASHBOARD => [R::SuperAdmin, R::Admin],

            // Admin
            P::MANAGE_ADMINS => [R::SuperAdmin],
            P::BROWSE_ADMINS => [R::SuperAdmin],
            P::READ_ADMIN => [R::SuperAdmin],
            P::EDIT_ADMIN => [R::SuperAdmin],
            P::ADD_ADMIN => [R::SuperAdmin],
            P::DELETE_ADMIN => [R::SuperAdmin],

            // User
            P::MANAGE_USERS => [R::SuperAdmin, R::Admin],
            P::BROWSE_USERS => [R::SuperAdmin, R::Admin],
            P::READ_USER => [R::SuperAdmin, R::Admin],
            P::EDIT_USER => [R::SuperAdmin, R::Admin],
            P::ADD_USER => [R::SuperAdmin, R::Admin],
            P::DELETE_USER => [R::SuperAdmin, R::Admin],

            // My attendance
            P::MANAGE_ATTENDANCES => [],
            P::BROWSE_ATTENDANCES => [],
            P::READ_ATTENDANCE => [],
            P::EDIT_ATTENDANCE => [],
            P::ADD_ATTENDANCE => [],
            P::DELETE_ATTENDANCE => [],

            // All user attendance
            P::MANAGE_USER_ATTENDANCES => [R::SuperAdmin, R::Admin],
            P::BROWSE_USER_ATTENDANCES => [R::SuperAdmin, R::Admin],
            P::READ_USER_ATTENDANCE => [R::SuperAdmin, R::Admin],
            P::EDIT_USER_ATTENDANCE => [R::SuperAdmin, R::Admin],
            P::ADD_USER_ATTENDANCE => [R::SuperAdmin, R::Admin],
            P::DELETE_USER_ATTENDANCE => [R::SuperAdmin, R::Admin],
        ];
    }

    public static function getPermissionsByRole(string $role): array
    {
        $permissions = [];

        foreach (self::assignments() as $permission => $roles) {
            if (in_array($role, array_map(fn(R $role) => $role->value, $roles), true)) {
                $permissions[] = $permission;
            }
        }

        return $permissions;
    }
}
