<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;

class RebuildPermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:rebuild-permissions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Rebuild Permissions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->call('db:seed', [
            '--class' => 'PermissionSeeder',
            '--force' => true,
        ]);
        $this->call('cache:clear');
    }
}
