<?php

namespace App\Http\Controllers\Voter;

use App\Http\Controllers\Controller;
use App\Models\Election;
use App\Models\Vote;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VoterDashboardController extends Controller
{
    /**
     * Display voter dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | ONGOING ELECTION
        |--------------------------------------------------------------------------
        */

        $ongoingElection = Election::query()
            ->where('start_at', '<=', now())
            ->where('end_at', '>=', now())
            ->orderBy('start_at')
            ->first();

        /*
        |--------------------------------------------------------------------------
        | CHECK IF VOTER ALREADY VOTED
        |--------------------------------------------------------------------------
        */

        $hasVoted = false;

        if ($ongoingElection) {
            $hasVoted = Vote::where('voter_id', $user->id)
                ->where('election_id', $ongoingElection->id)
                ->exists();
        }

        /*
        |--------------------------------------------------------------------------
        | UPCOMING ELECTIONS
        |--------------------------------------------------------------------------
        */

        $upcomingElections = Election::query()
            ->where('start_at', '>', now())
            ->orderBy('start_at')
            ->get()
            ->map(function ($election) {
                return $this->formatElection($election);
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | COMPLETED ELECTIONS
        |--------------------------------------------------------------------------
        */

        $completedElections = Election::query()
            ->where('end_at', '<', now())
            ->orderByDesc('end_at')
            ->get()
            ->map(function ($election) use ($user) {
                $electionData = $this->formatElection($election);
                $electionData['voted'] = Vote::where('voter_id', $user->id)
                    ->where('election_id', $election->id)
                    ->exists();

                return $electionData;
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | DASHBOARD
        |--------------------------------------------------------------------------
        */

        return Inertia::render('VoterSide/Dashboard', [

            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
            ],

            'ongoingElection' => $ongoingElection
                ? [
                    'id' => $ongoingElection->id,
                    'title' => $ongoingElection->title,
                    'description' => $ongoingElection->description,
                    'start_at' => $ongoingElection->start_at
                        ?->format('Y-m-d H:i:s'),
                    'end_at' => $ongoingElection->end_at
                        ?->format('Y-m-d H:i:s'),
                    'status' => $ongoingElection->status,
                    'has_voted' => $hasVoted,
                ]
                : null,

            'upcomingElections' => $upcomingElections,

            'completedElections' => $completedElections,
        ]);
    }

    /**
     * Format an election into a simple array for the frontend.
     */
    private function formatElection(Election $election): array
    {
        return [
            'id' => $election->id,
            'title' => $election->title,
            'description' => $election->description,
            'start_at' => $election->start_at?->format('Y-m-d H:i:s'),
            'end_at' => $election->end_at?->format('Y-m-d H:i:s'),
            'status' => $election->status,
        ];
    }
}
