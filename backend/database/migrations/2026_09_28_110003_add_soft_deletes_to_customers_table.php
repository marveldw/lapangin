<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add Soft Deletes to customers table and configure partial unique index per venue owner.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        if (!Schema::hasColumn('customers', 'deleted_at')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->softDeletes()->after('email');
            });
        }

        if ($driver === 'pgsql') {
            DB::statement("
                CREATE UNIQUE INDEX IF NOT EXISTS unique_active_customers_phone_per_owner 
                ON customers (owner_id, phone) 
                WHERE deleted_at IS NULL;
            ");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            DB::statement("DROP INDEX IF EXISTS unique_active_customers_phone_per_owner;");
        }

        if (Schema::hasColumn('customers', 'deleted_at')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};
