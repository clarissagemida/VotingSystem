<?php

namespace App\Http\Controllers\Voter;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Voter\Concerns\SortsByPositionOrder;
use App\Models\Election;
use App\Models\Vote;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ElectionController extends Controller
{
    use SortsByPositionOrder;

    /**
     * Display elections available to the voter.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Get list of election IDs the user has already voted in
        $votedElectionIds = Vote::query()
            ->where('voter_id', $user->id)
            ->pluck('election_id')
            ->unique()
            ->toArray();

        $elections = Election::query()
            ->withCount('candidates')
            ->orderBy('start_at', 'desc')
            ->get()
            ->map(function (Election $election) use ($votedElectionIds) {

                return [
                    'id' => $election->id,
                    'title' => $election->title,
                    'description' => $election->description,

                    'start_at' => $election->start_at
                        ?->format('Y-m-d H:i:s'),

                    'end_at' => $election->end_at
                        ?->format('Y-m-d H:i:s'),

                    'status' => $election->status,

                    'candidates_count' => $election->candidates_count,

                    'has_voted' => in_array($election->id, $votedElectionIds),
                ];
            });

        return Inertia::render(
            'VoterSide/Elections/Index',
            [
                'elections' => $elections,
            ]
        );
    }

    /**
     * Display one election and its candidates.
     */
    public function show(
        Request $request,
        Election $election
    ): Response {
        $user = $request->user();

        $hasVoted = Vote::query()
            ->where('voter_id', $user->id)
            ->where('election_id', $election->id)
            ->exists();

        $election->load([
            'partylists.organization.positions',
            'partylists.candidates',
            'candidates.organization',
            'candidates.partylist',
        ]);

        $positionOrder = $this->positionOrderMap();

        $orderedCandidates = $election->candidates
            ->map(function ($candidate) use ($positionOrder) {
                $candidate->__position_rank =
                    $positionOrder[$candidate->position_name] ?? PHP_INT_MAX;

                return $candidate;
            })
            ->sortBy([
                '__position_rank',
                'candidate_name',
            ])
            ->map(function ($candidate) {
                unset($candidate->__position_rank);

                return $candidate;
            })
            ->values();

        return Inertia::render(
            'VoterSide/Elections/Show',
            [
                'election' => [
                    'id' => $election->id,
                    'title' => $election->title,
                    'description' => $election->description,

                    'start_at' => $election->start_at
                        ?->format('Y-m-d H:i:s'),

                    'end_at' => $election->end_at
                        ?->format('Y-m-d H:i:s'),

                    'status' => $election->status,

                    'has_voted' => $hasVoted,
                ],

                'partylists' => $election->partylists,

                'candidates' => $orderedCandidates->map(function ($candidate) {
                    return [
                        'id' => $candidate->id,
                        'candidate_name' => $candidate->candidate_name,
                        'position_name' => $candidate->position_name,
                        'candidate_type' => $candidate->candidate_type,
                        'photo' => $candidate->photo,
                        'platform' => $candidate->platform,
                        'partylist' => $candidate->partylist ? [
                            'id' => $candidate->partylist->id,
                            'partylist_name' => $candidate->partylist->partylist_name,
                            'acronym' => $candidate->partylist->acronym,
                            'description' => $candidate->partylist->description,
                            'color' => $candidate->partylist->color,
                        ] : null,
                        'organization' => $candidate->organization ? [
                            'organization_name' => $candidate->organization->organization_name,
                        ] : null,
                    ];
                }),
            ]
        );
    }
}
