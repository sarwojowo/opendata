<?php

declare(strict_types=1);

namespace App\Constants;

class PermissionConstant extends Constant
{
    public const VIEW_HORIZON_DASHBOARD = 'view_horizon_dashboard';
    public const VIEW_ADMIN_DASHBOARD = 'view_admin_dashboard';

    // admin
    public const MANAGE_ADMINS = 'manage_admins';
    public const BROWSE_ADMINS = 'browse_admins';
    public const READ_ADMIN = 'read_admin';
    public const EDIT_ADMIN = 'edit_admin';
    public const ADD_ADMIN = 'add_admin';
    public const DELETE_ADMIN = 'delete_admin';

    // user
    public const MANAGE_USERS = 'manage_users';
    public const BROWSE_USERS = 'browse_users';
    public const READ_USER = 'read_user';
    public const EDIT_USER = 'edit_user';
    public const ADD_USER = 'add_user';
    public const DELETE_USER = 'delete_user';

    // my attendance
    public const MANAGE_ATTENDANCES = 'manage_attendances';
    public const BROWSE_ATTENDANCES = 'browse_attendances';
    public const READ_ATTENDANCE = 'read_attendance';
    public const EDIT_ATTENDANCE = 'edit_attendance';
    public const ADD_ATTENDANCE = 'add_attendance';
    public const DELETE_ATTENDANCE = 'delete_attendance';

    // all user attendance
    public const MANAGE_USER_ATTENDANCES = 'manage_user_attendances';
    public const BROWSE_USER_ATTENDANCES = 'browse_user_attendances';
    public const READ_USER_ATTENDANCE = 'read_user_attendance';
    public const EDIT_USER_ATTENDANCE = 'edit_user_attendance';
    public const ADD_USER_ATTENDANCE = 'add_user_attendance';
    public const DELETE_USER_ATTENDANCE = 'delete_user_attendance';
}
