<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partylists', function (Blueprint $table) {
            $table->id();

            $table->foreignId('election_id')
                ->constrained('elections')
                ->cascadeOnDelete();

            $table->foreignId('organization_id')
                ->constrained('organizations')
                ->cascadeOnDelete();

            $table->string('partylist_name');
            $table->string('acronym');
            $table->string('color')->default('#2563EB');

            $table->text('description')->nullable();

            $table->string('logo')->nullable();
            $table->string('banner')->nullable();

            $table->timestamps();

            $table->index([
                'election_id',
                'organization_id',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partylists');
    }
};
