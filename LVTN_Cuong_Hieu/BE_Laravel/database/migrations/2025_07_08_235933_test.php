<?php

// database/migrations/xxxx_xx_xx_xxxxxx_add_vnpay_to_tickets_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('tickets', function (Blueprint $table) {
            // Chỉ thêm các trường chưa có

            if (!Schema::hasColumn('tickets', 'payment_method')) {
                $table->string('payment_method')->after('status');
            }

            if (!Schema::hasColumn('tickets', 'vnpay_order_id')) {
                $table->string('vnpay_order_id')->nullable()->after('payment_method');
            }
            if (!Schema::hasColumn('tickets', 'vnpay_transaction_no')) {
                $table->string('vnpay_transaction_no')->nullable()->after('vnpay_order_id');
            }
            if (!Schema::hasColumn('tickets', 'paid_at')) {
                $table->timestamp('paid_at')->nullable()->after('vnpay_transaction_no');
            }

            // Cập nhật enum status nếu cần
            $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending')->change();
        });
    }

    public function down()
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn(['vnpay_order_id', 'vnpay_transaction_no', 'paid_at']);
            $table->enum('status', ['paid', 'cancelled'])->default('paid')->change();
        });
    }
};