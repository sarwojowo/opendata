<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Lang;

class GenerateTranslationKeys extends Command
{
    protected $signature = 'app:generate-translation-keys';

    protected $description = 'Generate translation keys for all languages';

    /**
     * @throws \JsonException
     */
    public function handle(): void
    {
        foreach (['en', 'id'] as $lang) {
            $filename = sprintf('%s.json', $lang);
            exec('rm '.lang_path($filename));

            $keys = Lang::get('app', [], $lang);
            $count = count($keys);
            $this->info("\nGenerating $count translation keys for $lang language");

            $fileContent = json_encode($keys, JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT);
            $fileContent = str_replace(':data', '{data}', $fileContent);

            $destination = lang_path($filename);
            file_put_contents($destination, $fileContent);

            $this->info("Done! -> file $destination rewritten");
        }
    }
}
