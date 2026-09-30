<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add Soft Deletes to bookings table and add index for customer_id.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        if (!Schema::hasColumn('bookings', 'deleted_at')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->softDeletes()->after('notes');
            });
        }

        if ($driver === 'pgsql') {
            DB::statement("CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings (customer_id);");
        } else {
            try {
                Schema::table('bookings', function (Blueprint $table) {
                    $table->index('customer_id', 'idx_bookings_customer_id');
                });
            } catch (\Throwable $e) {}
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            DB::statement("DROP INDEX IF EXISTS idx_bookings_customer_id;");
        } else {
            try {
                Schema::table('bookings', function (Blueprint $table) {
                    $table->dropIndex('idx_bookings_customer_id');
                });
            } catch (\Throwable $e) {}
        }

        if (Schema::hasColumn('bookings', 'deleted_at')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};
