<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add Soft Deletes to users table and configure partial unique indexes.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        if (!Schema::hasColumn('users', 'deleted_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->softDeletes()->after('status');
            });
        }

        if ($driver === 'pgsql') {
            // Drop legacy full unique constraints that conflict with soft deletes
            DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_unique;");
            DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_role_unique;");
            DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_unique;");

            // Create partial unique indexes (active records only)
            DB::statement("
                CREATE UNIQUE INDEX IF NOT EXISTS unique_active_users_email 
                ON users (email) 
                WHERE deleted_at IS NULL;
            ");

            DB::statement("
                CREATE UNIQUE INDEX IF NOT EXISTS unique_active_users_phone 
                ON users (phone) 
                WHERE deleted_at IS NULL AND phone IS NOT NULL AND phone != '';
            ");
        } else {
            try {
                Schema::table('users', function (Blueprint $table) {
                    $table->dropUnique('users_email_unique');
                });
            } catch (\Throwable $e) {}

            try {
                Schema::table('users', function (Blueprint $table) {
                    $table->dropUnique('users_phone_unique');
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
            DB::statement("DROP INDEX IF EXISTS unique_active_users_phone;");
            DB::statement("DROP INDEX IF EXISTS unique_active_users_email;");

            // Restore standard unique constraints
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_phone_unique UNIQUE (phone);");
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);");
        }

        if (Schema::hasColumn('users', 'deleted_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};
