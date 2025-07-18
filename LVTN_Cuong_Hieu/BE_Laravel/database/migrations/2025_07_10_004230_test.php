<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('tickets', function (Blueprint $table) {
            // Add missing columns
            if (!Schema::hasColumn('tickets', 'status')) {
                $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending');
            }

            if (!Schema::hasColumn('tickets', 'payment_method')) {
                $table->string('payment_method')->default('cash');
            }

            if (!Schema::hasColumn('tickets', 'vnpay_order_id')) {
                $table->string('vnpay_order_id')->nullable();
            }

            if (!Schema::hasColumn('tickets', 'vnpay_transaction_no')) {
                $table->string('vnpay_transaction_no')->nullable();
            }

            if (!Schema::hasColumn('tickets', 'paid_at')) {
                $table->timestamp('paid_at')->nullable();
            }
        });
    }

    public function down()
    {
        Schema::table('tickets', function (Blueprint $table) {
            if (Schema::hasColumn('tickets', 'payment_method')) {
                $table->dropColumn('payment_method');
            }
            if (Schema::hasColumn('tickets', 'vnpay_order_id')) {
                $table->dropColumn('vnpay_order_id');
            }
            if (Schema::hasColumn('tickets', 'vnpay_transaction_no')) {
                $table->dropColumn('vnpay_transaction_no');
            }
            if (Schema::hasColumn('tickets', 'paid_at')) {
                $table->dropColumn('paid_at');
            }
            // Không rollback enum vì nó phức tạp nếu không có dbal
        });
    }
};
