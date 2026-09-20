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
        $driver = DB::getDriverName();

        // 1. Pre-migration cleanup: sanitize empty strings and deduplicate
        if ($driver === 'pgsql') {
            DB::statement("
                WITH ranked_users AS (
                    SELECT user_id,
                           ROW_NUMBER() OVER (PARTITION BY phone ORDER BY created_at ASC, user_id ASC) as rn
                    FROM users
                    WHERE phone IS NOT NULL AND phone != ''
                )
                UPDATE users
                SET phone = NULL
                WHERE user_id IN (SELECT user_id FROM ranked_users WHERE rn > 1);
            ");

            DB::statement("UPDATE users SET phone = NULL WHERE phone = '';");
        } else {
            DB::table('users')->where('phone', '')->update(['phone' => null]);
        }

        // 2. Enforce DB-level unique constraint on users.phone
        Schema::table('users', function (Blueprint $table) {
            $table->unique('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['phone']);
        });
    }
};
