<?php

use Illuminate\Support\Facades\DB;
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
        Schema::create('subscriptions', function (Blueprint $table) {
        $table->id('subscription_id');
        $table->foreignId('user_id')->constrained('users', 'user_id');
        $table->foreignId('plan_id')->constrained('plans', 'plan_id');
        $table->date('start_date');
        $table->date('end_date')->nullable();
        $table->string('status', 20)->default('ACTIVE');
        $table->timestamps();
        });
        DB::statement("
            CREATE UNIQUE INDEX unique_active_subscription
            ON subscriptions(user_id)
            WHERE status = 'ACTIVE'
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
