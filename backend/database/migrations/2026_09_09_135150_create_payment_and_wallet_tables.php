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
        // 1. Log transaksi pembayaran masuk (QRIS Core API)
        Schema::create('transactions', function (Blueprint $table) {
            $table->id('transaction_id');
            $table->string('order_id', 100)->unique();
            $table->foreignId('user_id')->constrained('users', 'user_id')->cascadeOnDelete();
            $table->string('type', 30); // BOOKING, SUBSCRIPTION
            $table->unsignedBigInteger('reference_id'); // booking_id atau plan_id
            $table->unsignedBigInteger('gross_amount');
            $table->string('status', 30)->default('PENDING'); // PENDING, SETTLEMENT, EXPIRE, CANCEL, DENY
            $table->string('payment_type', 30)->default('qris');
            $table->text('qr_url')->nullable(); // URL gambar QR dari Midtrans
            $table->text('qr_string')->nullable(); // Raw payload string QRIS
            $table->timestamp('expires_at')->nullable();
            $table->json('payload_response')->nullable();
            $table->timestamps();

            $table->index(['type', 'reference_id']);
            $table->index('status');
        });

        // 2. Dompet Saldo Venue Owner
        Schema::create('wallets', function (Blueprint $table) {
            $table->id('wallet_id');
            $table->foreignId('owner_id')->unique()->constrained('users', 'user_id')->cascadeOnDelete();
            $table->unsignedBigInteger('balance')->default(0); // Saldo aktif yang bisa ditarik
            $table->unsignedBigInteger('locked_balance')->default(0); // Saldo yang sedang dalam proses penarikan
            $table->timestamps();
        });

        // 3. Catatan Mutasi Keluar/Masuk Saldo
        Schema::create('wallet_mutations', function (Blueprint $table) {
            $table->id('mutation_id');
            $table->foreignId('wallet_id')->constrained('wallets', 'wallet_id')->cascadeOnDelete();
            $table->string('type', 10); // CREDIT (masuk) atau DEBIT (keluar)
            $table->unsignedBigInteger('amount');
            $table->unsignedBigInteger('balance_before');
            $table->unsignedBigInteger('balance_after');
            $table->string('description');
            $table->string('reference_type', 30)->nullable(); // BOOKING, WITHDRAWAL
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->timestamps();

            $table->index('wallet_id');
        });

        // 4. Pengajuan Penarikan Dana (Withdrawal)
        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id('withdrawal_id');
            $table->string('withdrawal_code', 100)->unique();
            $table->foreignId('wallet_id')->constrained('wallets', 'wallet_id')->cascadeOnDelete();
            $table->unsignedBigInteger('amount');
            $table->string('bank_name', 50);
            $table->string('account_number', 50);
            $table->string('account_holder', 100);
            $table->string('status', 30)->default('PENDING'); // PENDING, PROCESSING, COMPLETED, REJECTED
            $table->string('proof_url')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();

            $table->index('wallet_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('withdrawals');
        Schema::dropIfExists('wallet_mutations');
        Schema::dropIfExists('wallets');
        Schema::dropIfExists('transactions');
    }
};
