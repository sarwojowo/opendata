<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * @throws \Throwable
     */
    public function run(): void
    {
        if (config('database.default') === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            DB::table('model_has_permissions')->truncate();
            DB::table('role_has_permissions')->truncate();
            DB::table('permissions')->truncate();
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        } else {
            DB::table('model_has_permissions')->truncate();
            DB::table('role_has_permissions')->truncate();
            DB::table('permissions')->truncate();
        }


        $roleCount = count(\App\Enums\RoleEnum::cases());
        $assignments = collect(\App\PermissionAssignment::assignments());
        $totalAssignment = $assignments->count();

        $this->command->info("  Seeding $totalAssignment permissions into $roleCount roles (this may take a while)...");

        $assignments->chunk(20)->each(function ($chunk) {
            DB::transaction(function () use ($chunk) {
                $chunk->each(fn($roles, $permission) => $this->savePermission($permission, $roles));
            });
        });

        Artisan::call('cache:clear');
    }

    private function savePermission($index, $roles): void
    {
        $permission = Permission::firstOrCreate(['name' => $index]);

        collect($roles)->each(fn($role) => $this->givePermission($role, $permission));
    }

    private function givePermission($role, $permission): void
    {
        $roleName = ($role instanceof \App\Enums\RoleEnum) ? $role->value : $role;

        Role::firstOrCreate(['name' => $roleName])
            ->givePermissionTo($permission->name);
    }
}
