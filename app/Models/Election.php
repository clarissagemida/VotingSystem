<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Election extends Model
{
    protected $fillable = [
        'title',
        'description',
        'start_at',
        'end_at',
    ];

    // attributes that should be cast to native types
    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
    ];

    public function getStatusAttribute(): string
    {
        $now = Carbon::now();

        if ($now->lt($this->start_at)) {
            return 'Upcoming';
        }

        if ($now->gte($this->start_at) && $now->lte($this->end_at)) {
            return 'Ongoing';
        }

        return 'Completed';
    }

    public function partylists()
    {
        return $this->hasMany(Partylist::class);
    }

    public function candidates()
    {
        return $this->hasMany(Candidate::class);
    }
}
