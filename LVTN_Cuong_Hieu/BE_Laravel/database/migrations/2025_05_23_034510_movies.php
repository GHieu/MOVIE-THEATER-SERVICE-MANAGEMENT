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
        schema::create('movies', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->integer('duration');
            $table->string('genre');
            $table->string('director');
            $table->text('cast');
            $table->string('nation');
            $table->string('poster');
            $table->string('banner');
            $table->enum('age', ['P', 'T13', 'T16', 'T18']);
            $table->string('trailer_url');
            $table->date('release_date');
            $table->date('end_date');
            $table->boolean('status');
            $table->enum('type', ['now_showing', 'coming_soon', 'stop_showing'])->default('coming_soon');
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