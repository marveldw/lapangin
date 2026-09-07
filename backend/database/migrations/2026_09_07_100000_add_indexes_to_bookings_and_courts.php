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
            $table->index(['owner_id', 'status'], 'idx_courts_owner_status');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->index(['court_id', 'booking_date', 'status'], 'idx_bookings_court_date_status');
            $table->index(['booking_date', 'status'], 'idx_bookings_date_status');
            $table->index('user_id', 'idx_bookings_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courts', function (Blueprint $table) {
            $table->dropIndex('idx_courts_owner_status');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex('idx_bookings_court_date_status');
            $table->dropIndex('idx_bookings_date_status');
            $table->dropIndex('idx_bookings_user_id');
        });
    }
};
