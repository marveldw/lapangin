<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Alter columns to nullable
        Schema::table('plans', function (Blueprint $table) {
            $table->integer('max_courts')->nullable()->change();
            $table->integer('max_bookings_per_month')->nullable()->change();
        });

        // Update default values per requirements: FREE = 1, BASIC = 5, PRO = NULL
        DB::table('plans')->where('name', 'FREE')->update([
            'max_courts'             => 1,
            'max_bookings_per_month' => 30,
        ]);

        DB::table('plans')->where('name', 'BASIC')->update([
            'max_courts'             => 5,
            'max_bookings_per_month' => null,
        ]);

        DB::table('plans')->where('name', 'PRO')->update([
            'max_courts'             => null,
            'max_bookings_per_month' => null,
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->integer('max_courts')->nullable(false)->change();
            $table->integer('max_bookings_per_month')->nullable(false)->change();
        });
    }
};
