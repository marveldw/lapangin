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
        Schema::create('courts', function (Blueprint $table) {
        $table->id('court_id');
        $table->foreignId('owner_id')->constrained('users', 'user_id');
        $table->string('name');
        $table->string('sport_type');
        $table->text('description')->nullable();
        $table->unsignedBigInteger('price_per_hour');
        $table->string('location');
        $table->string('image_url')->nullable();
        $table->string('status', 20)->default('ACTIVE');
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courts');
    }
};
