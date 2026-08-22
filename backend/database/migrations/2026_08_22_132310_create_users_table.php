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
        Schema::create('users', function (Blueprint $table) {
        $table->id('user_id');
        $table->string('name');
        $table->string('email')->unique();
        $table->string('password_hash');
        $table->string('phone', 20)->nullable();
        $table->string('role', 20)->default('OWNER');
        $table->string('status', 20)->default('ACTIVE');
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
