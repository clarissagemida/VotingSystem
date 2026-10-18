<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | IDEMPOTENT COLUMN GUARDS
        |
        | election_id was already added by
        | 2026_08_18_132132_add_independent_support_to_candidates_table,
        | which made this migration fail halfway and left the
        | organization_id column missing. Only add what is missing.
        |--------------------------------------------------------------------------
        */

        Schema::table('candidates', function (Blueprint $table) {

            if (
                ! Schema::hasColumn(
                    'candidates',
                    'election_id'
                )
            ) {
                $table->foreignId('election_id')
                    ->nullable()
                    ->after('partylist_id')
                    ->constrained('elections')
                    ->nullOnDelete();
            }

            if (
                ! Schema::hasColumn(
                    'candidates',
                    'organization_id'
                )
            ) {
                $table->foreignId('organization_id')
                    ->nullable()
                    ->after('election_id')
                    ->constrained('organizations')
                    ->nullOnDelete();
            }

        });
    }

    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {

            if (Schema::hasColumn('candidates', 'organization_id')) {
                $table->dropForeign([
                    'candidates_organization_id_foreign',
                ]);

                $table->dropColumn([
                    'organization_id',
                ]);
            }
        });
    }
};
