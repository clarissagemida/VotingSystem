<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Election;
use App\Models\Organization;
use App\Models\Partylist;
use App\Models\User;
use App\Models\Vote;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        /*
        |--------------------------------------------------------------------------
        | DASHBOARD STATISTICS
        |--------------------------------------------------------------------------
        */

        $totalVoters = User::where('role', 'voter')->count();

        $activeElections = Election::where('start_at', '<=', now())
            ->where('end_at', '>=', now())
            ->count();

        $totalPartylists = Partylist::count();

        $totalOrganizations = Organization::count();

        /*
        |--------------------------------------------------------------------------
        | VOTER TURNOUT
        |--------------------------------------------------------------------------
        */

        $votersVoted = Vote::query()
            ->distinct('voter_id')
            ->count('voter_id');

        $votersNotVoted = max(0, $totalVoters - $votersVoted);

        $voterTurnoutPercent = $totalVoters > 0
            ? round(($votersVoted / $totalVoters) * 100, 1)
            : 0;

        /*
        |--------------------------------------------------------------------------
        | VOTE LOG (one entry per voter who has voted)
        |--------------------------------------------------------------------------
        */

        $voteLog = Vote::query()
            ->with(['voter', 'election'])
            ->orderBy('created_at', 'desc')
            ->limit(5000)
            ->get()
            ->groupBy('voter_id')
            ->map(function ($votes) {
                $latest = $votes->first();

                return [
                    'voter' => [
                        'id' => $latest->voter?->id,
                        'name' => $latest->voter?->name,
                        'username' => $latest->voter?->username,
                    ],
                    'election' => [
                        'id' => $latest->election?->id,
                        'title' => $latest->election?->title,
                    ],
                    'positions' => $votes->count(),
                    'voted_at' => $latest->created_at?->format('Y-m-d H:i:s'),
                ];
            })
            ->sortByDesc('voted_at')
            ->values();

        /*
        |--------------------------------------------------------------------------
        | PER-ELECTION TURNOUT
        |--------------------------------------------------------------------------
        */

        $electionTurnout = Election::query()
            ->get()
            ->map(function (Election $election) use ($totalVoters) {
                $votedCount = Vote::query()
                    ->where('election_id', $election->id)
                    ->distinct('voter_id')
                    ->count('voter_id');

                return [
                    'id' => $election->id,
                    'title' => $election->title,
                    'status' => $this->electionStatus($election),
                    'voted' => $votedCount,
                    'total_voters' => $totalVoters,
                    'percent' => $totalVoters > 0
                        ? round(($votedCount / $totalVoters) * 100, 1)
                        : 0,
                ];
            })
            ->sortByDesc('voted')
            ->values();

        /*
        |--------------------------------------------------------------------------
        | DASHBOARD
        |--------------------------------------------------------------------------
        */

        return Inertia::render('AdminSide/Dashboard', [
            'totalVoters' => $totalVoters,
            'activeElections' => $activeElections,
            'totalPartylists' => $totalPartylists,
            'totalOrganizations' => $totalOrganizations,
            'votersVoted' => $votersVoted,
            'votersNotVoted' => $votersNotVoted,
            'voterTurnoutPercent' => $voterTurnoutPercent,
            'voteLog' => $voteLog,
            'electionTurnout' => $electionTurnout,
        ]);
    }

    /**
     * Resolve the textual status of an election based on its schedule.
     */
    private function electionStatus(Election $election): string
    {
        $now = now();

        if ($election->start_at > $now) {
            return 'Upcoming';
        }

        if ($election->end_at < $now) {
            return 'Closed';
        }

        return 'Ongoing';
    }
}
