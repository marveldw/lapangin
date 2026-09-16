<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Rectify unconstrained/inconsistent column types and add DB integrity constraints.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        // ---------------------------------------------------------------------
        // 1. Wallets: Clean existing invalid/non-numeric data and enforce unique
        //    scoped to (bank_name, account_number).
        // ---------------------------------------------------------------------
        if ($driver === 'pgsql') {
            // Convert invalid accounts (e.g. letters, empty strings) to NULL
            DB::statement("
                UPDATE wallets
                SET account_number = NULL, bank_name = NULL, account_holder = NULL
                WHERE account_number !~ '^[0-9]+$' OR account_number = '' OR bank_name = ''
            ");

            // Create composite unique index
            DB::statement("
                CREATE UNIQUE INDEX IF NOT EXISTS unique_wallet_bank_account
                ON wallets (bank_name, account_number)
                WHERE bank_name IS NOT NULL
                  AND account_number IS NOT NULL
                  AND bank_name != ''
                  AND account_number != ''
            ");
        } else {
            DB::table('wallets')
                ->where('account_number', '')
                ->orWhere('bank_name', '')
                ->update([
                    'account_number' => null,
                    'bank_name'      => null,
                ]);
        }

        // ---------------------------------------------------------------------
        // 2. Bookings: Constrain booking_code to VARCHAR(32)
        // ---------------------------------------------------------------------
        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE bookings ALTER COLUMN booking_code TYPE VARCHAR(32);");
            DB::statement("ALTER TABLE bookings ADD CONSTRAINT chk_bookings_price CHECK (price >= 0);");
        }

        // ---------------------------------------------------------------------
        // 3. Customers: Constrain phone to VARCHAR(20)
        // ---------------------------------------------------------------------
        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE customers ALTER COLUMN phone TYPE VARCHAR(20);");
        }

        // ---------------------------------------------------------------------
        // 4. Courts: Constrain sport_type to VARCHAR(50) and price_per_hour >= 0
        // ---------------------------------------------------------------------
        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE courts ALTER COLUMN sport_type TYPE VARCHAR(50);");
            DB::statement("ALTER TABLE courts ADD CONSTRAINT chk_courts_price_per_hour CHECK (price_per_hour >= 0);");
        }

        // ---------------------------------------------------------------------
        // 5. Court Operating Hours: Add check constraint for day_of_week (0-6)
        // ---------------------------------------------------------------------
        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE court_operating_hours ADD CONSTRAINT chk_day_of_week CHECK (day_of_week >= 0 AND day_of_week <= 6);");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            DB::statement("DROP INDEX IF EXISTS unique_wallet_bank_account;");
            DB::statement("ALTER TABLE bookings DROP CONSTRAINT IF EXISTS chk_bookings_price;");
            DB::statement("ALTER TABLE courts DROP CONSTRAINT IF EXISTS chk_courts_price_per_hour;");
            DB::statement("ALTER TABLE court_operating_hours DROP CONSTRAINT IF EXISTS chk_day_of_week;");
            DB::statement("ALTER TABLE bookings ALTER COLUMN booking_code TYPE VARCHAR(255);");
            DB::statement("ALTER TABLE customers ALTER COLUMN phone TYPE VARCHAR(255);");
            DB::statement("ALTER TABLE courts ALTER COLUMN sport_type TYPE VARCHAR(255);");
        }
    }
};
