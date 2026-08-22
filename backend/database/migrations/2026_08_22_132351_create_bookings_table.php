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
        Schema::create('bookings', function (Blueprint $table) {
        $table->id('booking_id');
        $table->string('booking_code')->unique();
        $table->foreignId('court_id')->constrained('courts', 'court_id');
        $table->foreignId('customer_id')->constrained('customers', 'customer_id');
        $table->date('booking_date');
        $table->time('start_time');
        $table->time('end_time');
        $table->unsignedBigInteger('price');
        $table->string('status', 20)->default('PENDING');
        $table->string('notes')->nullable();
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
