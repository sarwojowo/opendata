<?php

declare(strict_types=1);

namespace App\Console\Commands\TypeScriptSupport;

use App\Constants\PermissionConstant;
use Illuminate\Console\Command;

class GeneratePermissionConstants extends Command
{
    /**
     * @var string
     */
    protected $signature = 'app:generate-permission-constants';

    /**
     * @var string
     */
    protected $description = 'Generate Permission.ts';

    public function handle(): void
    {
        $path = resource_path('js/permission.ts');

        $permissions = PermissionConstant::get()->toArray();
        $fileContent = "// Generated file, do not manually edit. Generate from BE instead (php artisan app:generate-permission-constants)\n";
        $fileContent .= 'export const Permissions = {';
        foreach ($permissions as $key => $value) {
            $fileContent .= "\n  $key: '$value',";
        }
        $fileContent .= "\n};\n";

        file_put_contents($path, $fileContent);
    }
}
