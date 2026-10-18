<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->string('candidate_type')
                ->default('partylist')
                ->after('partylist_id');

            $table->foreignId('election_id')
                ->nullable()
                ->after('candidate_type');
        });

        Schema::table('candidates', function (Blueprint $table) {
            $table->foreign('election_id')
                ->references('id')
                ->on('elections')
                ->nullOnDelete();
        });

        Schema::table('candidates', function (Blueprint $table) {
            $table->foreignId('partylist_id')
                ->nullable()
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->dropForeign([
                'election_id',
            ]);

            $table->dropColumn([
                'election_id',
                'candidate_type',
            ]);
        });
    }
};
