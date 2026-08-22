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
        Schema::create('court_operating_hours', function (Blueprint $table) {
        $table->id('court_operating_hour_id');
        $table->foreignId('court_id')->constrained('courts', 'court_id');
        $table->integer('day_of_week'); // 0=Sunday, 6=Saturday
        $table->time('open_time')->nullable();
        $table->time('close_time')->nullable();
        $table->boolean('is_closed')->default(false);
        $table->timestamps();

        $table->unique(['court_id', 'day_of_week']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('court_operating_hours');
    }
};
