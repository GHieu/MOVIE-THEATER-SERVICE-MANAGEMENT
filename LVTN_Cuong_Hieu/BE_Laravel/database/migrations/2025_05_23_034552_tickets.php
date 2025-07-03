<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('showtime_id')->constrained('showtimes')->onDelete('cascade');
            $table->foreignId('promotion_id')->nullable()->constrained('promotions')->nullOnDelete();
            $table->decimal('total_price', 10, 2);
            $table->enum('status', ['pending', 'paid', 'canceled'])->default('pending');


            $table->string('vnpay_order_id')->nullable()->after('status');
            $table->string('vnpay_transaction_no')->nullable()->after('vnpay_order_id');
            $table->timestamp('paid_at')->nullable()->after('vnpay_transaction_no');
            $table->string('payment_method')->default('cash')->change();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};