<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add Soft Deletes to plans table and configure partial unique index for plan name.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        if (!Schema::hasColumn('plans', 'deleted_at')) {
            Schema::table('plans', function (Blueprint $table) {
                $table->softDeletes()->after('is_active');
            });
        }

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE plans DROP CONSTRAINT IF EXISTS plans_name_unique;");

            DB::statement("
                CREATE UNIQUE INDEX IF NOT EXISTS unique_active_plans_name 
                ON plans (name) 
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
            DB::statement("DROP INDEX IF EXISTS unique_active_plans_name;");
            DB::statement("ALTER TABLE plans ADD CONSTRAINT plans_name_unique UNIQUE (name);");
        }

        if (Schema::hasColumn('plans', 'deleted_at')) {
            Schema::table('plans', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};
