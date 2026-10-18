<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organization extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
    ];

    public function positions(): HasMany
    {
        return $this->hasMany(
            OrganizationPosition::class
        )->orderBy('position_order');
    }

    public function partylists(): HasMany
    {
        return $this->hasMany(Partylist::class);
    }

    public function candidates(): HasMany
    {
        return $this->hasMany(Candidate::class);
    }
}
