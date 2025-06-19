<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.aaaaaaaaaaaaaaaaaa
     */
    public function up(): void
    {
        Schema::create('ticket_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('tickets')->onDelete('cascade');
            $table->foreignId('seat_id')->constrained('seats')->onDelete('cascade');
            $table->decimal('price', 10, 2); // giá cho ghế này (áp dụng KM nếu cần)
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