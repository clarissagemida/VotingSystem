<?php

namespace App\Http\Controllers\Voter;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Voter\Concerns\SortsByPositionOrder;
use App\Models\Election;
use App\Models\Vote;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VoteHistoryController extends Controller
{
    use SortsByPositionOrder;

    /**
     * Display voter's voting history.
     */
    public function index(
        Request $request
    ): Response {

        $votes = Vote::query()
            ->where(
                'voter_id',
                $request->user()->id
            )
            ->with([
                'election',
                'candidate.partylist',
            ])
            ->orderBy(
                'created_at',
                'desc'
            )
            ->get()
            ->map(function (Vote $vote) {

                return [
                    'id' => $vote->id,

                    'election' => [
                        'id' => $vote->election?->id,

                        'title' => $vote->election?->title,
                    ],

                    'candidate' => [
                        'id' => $vote->candidate?->id,

                        'name' => $vote->candidate?->candidate_name,

                        'photo' => $vote->candidate?->photo,
                    ],

                    'partylist' => $vote->candidate?->partylist
                        ?->partylist_name,

                    'position' => $vote->position_name,

                    'voted_at' => $vote->created_at
                        ?->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render(
            'VoterSide/VoteHistory/Index',
            [
                'votes' => $votes,
            ]
        );
    }

    /**
     * Display history for one election.
     */
    public function election(
        Request $request,
        Election $election
    ): Response {

        $positionOrderMap = $this->positionOrderMap();

        $votes = Vote::query()
            ->where(
                'voter_id',
                $request->user()->id
            )
            ->where(
                'election_id',
                $election->id
            )
            ->with([
                'candidate.partylist',
            ])
            ->get()
            ->map(function (Vote $vote) use ($positionOrderMap) {
                $vote->__position_rank =
                    $positionOrderMap[$vote->position_name] ?? PHP_INT_MAX;

                return $vote;
            })
            ->sortBy([
                '__position_rank',
                'position_name',
            ])
            ->map(function (Vote $vote) {
                unset($vote->__position_rank);

                return $vote;
            })
            ->values()
            ->map(function (Vote $vote) {
                return [
                    'id' => $vote->id,
                    'candidate' => [
                        'id' => $vote->candidate?->id,
                        'name' => $vote->candidate?->candidate_name,
                        'photo' => $vote->candidate?->photo,
                    ],
                    'partylist' => $vote->candidate?->partylist?->partylist_name,
                    'position' => $vote->position_name,
                    'voted_at' => $vote->created_at?->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render(
            'VoterSide/VoteHistory/Election',
            [
                'election' => [
                    'id' => $election->id,

                    'title' => $election->title,
                ],

                'votes' => $votes,
            ]
        );
    }
}
