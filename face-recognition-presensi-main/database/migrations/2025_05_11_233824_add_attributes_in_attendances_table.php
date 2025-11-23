<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->date('date')->nullable();
            $table->float('check_in_photo_distance')->nullable();
            $table->float('check_out_photo_distance')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn('date');
            $table->dropColumn('check_in_photo_distance');
            $table->dropColumn('check_out_photo_distance');
        });
    }
};
