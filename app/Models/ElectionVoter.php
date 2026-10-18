<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ElectionVoter extends Model
{
    use HasFactory;

    protected $fillable = [
        'election_id',
        'voter_id',
    ];

    public function election(): BelongsTo
    {
        return $this->belongsTo(
            Election::class
        );
    }

    public function voter(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'voter_id'
        );
    }
}
