<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Partylist extends Model
{
    use HasFactory;

    protected $fillable = [
        'election_id',
        'organization_id',
        'partylist_name',
        'acronym',
        'color',
        'description',
        'logo',
        'banner',
    ];

    /*
    |--------------------------------------------------------------------------
    | ELECTION
    |--------------------------------------------------------------------------
    */

    public function election(): BelongsTo
    {
        return $this->belongsTo(
            Election::class,
            'election_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ORGANIZATION
    |--------------------------------------------------------------------------
    */

    public function organization(): BelongsTo
    {
        return $this->belongsTo(
            Organization::class,
            'organization_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | CANDIDATES
    |--------------------------------------------------------------------------
    */

    public function candidates(): HasMany
    {
        return $this->hasMany(
            Candidate::class,
            'partylist_id'
        );
    }
}
