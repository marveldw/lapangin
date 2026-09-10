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
        Schema::create('regencies', function (Blueprint $table) {
            $table->string('id', 10)->primary();
            $table->string('province_code', 10)->index();
            $table->string('province_name', 100);
            $table->string('name', 150)->index();
            $table->string('alt_name', 150)->nullable()->index();
            $table->string('type', 20)->default('KABUPATEN');
            $table->timestamps();
        });

        Schema::create('districts', function (Blueprint $table) {
            $table->string('id', 15)->primary();
            $table->string('regency_id', 10)->index();
            $table->string('regency_name', 150)->index();
            $table->string('name', 150)->index();
            $table->timestamps();

            $table->foreign('regency_id')->references('id')->on('regencies')->onDelete('cascade');
        });

        $sqlPath = database_path('data/indonesian_regions.sql');
        if (file_exists($sqlPath)) {
            $raw = file_get_contents($sqlPath);
            $statements = preg_split('/;\s*[\r\n]+/', $raw);
            foreach ($statements as $stmt) {
                $trimmed = trim($stmt);
                if (!empty($trimmed)) {
                    DB::unprepared($trimmed . ';');
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('districts');
        Schema::dropIfExists('regencies');
    }
};
