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
        Schema::table('courts', function (Blueprint $table) {
            // Rename location to address for clarity
            $table->renameColumn('location', 'address');

            // Add city and district for location-based filtering
            $table->string('city', 100)->after('location')->index();
            $table->string('district', 100)->nullable()->after('city')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courts', function (Blueprint $table) {
            $table->dropIndex(['city']);
            $table->dropIndex(['district']);
            $table->dropColumn(['city', 'district']);
            $table->renameColumn('address', 'location');
        });
    }
};
