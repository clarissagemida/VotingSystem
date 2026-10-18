<?php

namespace App\Http\Controllers\Voter;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Voter\Concerns\SortsByPositionOrder;
use App\Models\Candidate;
use App\Models\Election;
use App\Models\Vote;
use App\Support\VoterNotifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class VotingController extends Controller
{
    use SortsByPositionOrder;

    /**
     * Display the ballot.
     */
    public function create(
        Request $request,
        Election $election
    ) {
        $user = $request->user();

        /*
         * Check if voter has already voted in this election.
         * If they have, prevent them from voting again and redirect to their vote history.
         */
        $hasVoted = Vote::query()
            ->where('voter_id', $user->id)
            ->where('election_id', $election->id)
            ->exists();

        if ($hasVoted) {
            return redirect()
                ->route('voter.vote.history.election', $election)
                ->with('info', 'You have already voted in this election. Multiple submissions are not allowed.');
        }

        /*
         * Only allow voting while election is ongoing.
         */
        abort_unless(
            $election->status === 'Ongoing',
            403,
            'This election is not currently open for voting.'
        );

        $positionOrder = $this->positionOrderMap();

        /*
         * Load all candidates belonging to this election, ordered from the
         * highest position down to the lowest (then alphabetically by name).
         */
        $candidates = Candidate::query()
            ->where('election_id', $election->id)
            ->with([
                'partylist',
                'organization.positions',
            ])
            ->get()
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

        /*
         * Get positions.
         */
        $positions = $candidates
            ->pluck('position_name')
            ->unique()
            ->values();

        return Inertia::render(
            'VoterSide/Voting/Index',
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
                    'has_voted' => false,
                ],

                'candidates' => $candidates,

                'positions' => $positions,

                'votedPositions' => [],
            ]
        );
    }

    /**
     * Submit ballot.
     */
    public function store(
        Request $request,
        Election $election
    ) {
        $user = $request->user();

        /*
         * Make sure election is ongoing.
         */
        if ($election->status !== 'Ongoing') {
            throw ValidationException::withMessages([
                'votes' => 'Voting is currently closed for this election.',
            ]);
        }

        /*
         * Strict check: Voter cannot vote more than once in an election.
         * Performed inside the transaction so the duplicate check and the
         * ballot insertion are atomic, preventing concurrent double-voting.
         */
        $validated = $request->validate([
            'votes' => [
                'required',
                'array',
                'min:1',
            ],

            'votes.*' => [
                'required',
                'integer',
                'exists:candidates,id',
            ],
        ]);

        DB::transaction(function () use (
            $user,
            $election,
            $validated
        ) {
            $alreadyVoted = Vote::query()
                ->where('voter_id', $user->id)
                ->where('election_id', $election->id)
                ->exists();

            if ($alreadyVoted) {
                throw ValidationException::withMessages([
                    'votes' => 'You have already submitted your vote for this election. You cannot vote again.',
                ]);
            }

            $seenPositions = [];

            foreach ($validated['votes'] as $candidateId) {

                $candidate = Candidate::query()
                    ->where('id', $candidateId)
                    ->where(
                        'election_id',
                        $election->id
                    )
                    ->firstOrFail();

                /*
                 * Prevent selecting multiple candidates for the same position in single submission.
                 */
                if (in_array($candidate->position_name, $seenPositions)) {
                    throw ValidationException::withMessages([
                        'votes' => "You can only select one candidate for {$candidate->position_name}.",
                    ]);
                }
                $seenPositions[] = $candidate->position_name;

                Vote::create([
                    'voter_id' => $user->id,
                    'election_id' => $election->id,
                    'candidate_id' => $candidate->id,
                    'position_name' => $candidate->position_name,
                ]);
            }
        });

        VoterNotifier::record([
            'action' => 'voted',
            'title' => 'Ballot Submitted',
            'message' => $user->name.' submitted their ballot for "'.$election->title.'".',
            'voter_name' => $user->name,
            'election' => $election->title,
        ]);

        return redirect()
            ->route(
                'voter.vote.history.election',
                $election
            )
            ->with(
                'success',
                'Your vote has been successfully submitted and recorded.'
            );
    }
}
