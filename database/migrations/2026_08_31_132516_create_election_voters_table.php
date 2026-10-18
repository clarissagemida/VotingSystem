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
        Schema::create('election_voters', function (Blueprint $table) {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | Election
            |--------------------------------------------------------------------------
            */

            $table->foreignId('election_id')
                ->constrained('elections')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Voter
            |--------------------------------------------------------------------------
            |
            | References users.id.
            |
            */

            $table->foreignId('voter_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Prevent duplicate eligibility
            |--------------------------------------------------------------------------
            |
            | A voter can only be registered once for the same election.
            |
            */

            $table->unique([
                'election_id',
                'voter_id',
            ]);

            /*
            |--------------------------------------------------------------------------
            | Indexes
            |--------------------------------------------------------------------------
            */

            $table->index('election_id');
            $table->index('voter_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('election_voters');
    }
};
