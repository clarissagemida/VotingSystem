<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Candidate extends Model
{
    use HasFactory;

    /*
    |--------------------------------------------------------------------------
    | MASS ASSIGNMENT
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'partylist_id',
        'election_id',
        'candidate_type',
        'candidate_name',
        'position_name',
        'photo',
        'platform',
        'organization_id',
    ];

    /**
     * Candidate belongs to a partylist.
     */
    public function partylist(): BelongsTo
    {
        return $this->belongsTo(Partylist::class);
    }

    /**
     * Candidate belongs to an election.
     */
    public function election(): BelongsTo
    {
        return $this->belongsTo(Election::class);
    }

    // determine if the candidate is independent

    public function isIndependent(): bool
    {
        return $this->candidate_type === 'independent';
    }

    /**
     * Determine if the candidate belongs to a partylist.
     */
    public function isPartylistCandidate(): bool
    {
        return $this->candidate_type === 'partylist';
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
