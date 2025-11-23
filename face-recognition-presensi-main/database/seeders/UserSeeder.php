<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        RoleEnum::getEnumCollection()
            ->each(function (RoleEnum $role) {
                $user = User::factory()
                    ->create([
                        'name' => $role->translated(),
                        'email' => sprintf('%s@example.com', $role->value),
                    ]);

                $user->assignRole($role->value);
            });
    }
}
