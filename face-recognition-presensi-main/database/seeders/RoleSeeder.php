<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @throws \Throwable
     */
    public function run(): void
    {
        collect(\App\Enums\RoleEnum::cases())
            ->each(static fn ($role) => Role::firstOrCreate(['name' => $role]));
    }
}
