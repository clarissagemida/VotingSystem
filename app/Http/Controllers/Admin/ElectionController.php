<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreElectionRequest;
use App\Http\Requests\Admin\UpdateElectionRequest;
use App\Models\AuditLog;
use App\Models\Election;
use App\Models\ElectionVoter;
use App\Models\User;
use App\Support\ElectionResults;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ElectionController extends Controller
{
    public function liveData(Election $election, ElectionResults $results): JsonResponse
    {
        $data = $results->forElection($election);

        return response()->json($data, 200, ['Cache-Control' => 'no-store, private']);
    }

    /**
     * Display a listing of elections.
     */
    public function index(): Response
    {
        $elections = Election::query()
            ->orderBy('start_at', 'desc')
            ->get()
            ->map(function (Election $election) {
                return [
                    'id' => $election->id,

                    'title' => $election->title,

                    'description' => $election->description,

                    'start_at' => $election->start_at
                        ?->format('Y-m-d H:i:s'),

                    'end_at' => $election->end_at
                        ?->format('Y-m-d H:i:s'),

                    /*
                    |--------------------------------------------------------------------------
                    | Status is an Eloquent accessor.
                    | It is NOT a database column.
                    |--------------------------------------------------------------------------
                    */

                    'status' => $election->status,

                    'created_at' => $election->created_at
                        ?->format('Y-m-d H:i:s'),

                    'updated_at' => $election->updated_at
                        ?->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render(
            'AdminSide/Elections/Index',
            [
                'elections' => $elections,
            ]
        );
    }

    /**
     * Show the form for creating a new election.
     */
    public function create(): Response
    {
        return Inertia::render(
            'AdminSide/Elections/Create'
        );
    }

    /**
     * Store a newly created election.
     */
    public function store(
        StoreElectionRequest $request
    ): RedirectResponse|JsonResponse {

        DB::transaction(function () use ($request) {

            $election = Election::create([
                'title' => $request->title,

                'description' => $request->description,

                'start_at' => $request->start_at,

                'end_at' => $request->end_at,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Audit Log
            |--------------------------------------------------------------------------
            */

            $this->logAction(
                'create_election',
                'Created election: '.
                    $election->title,
                $election,
                [
                    'title' => $election->title,

                    'start_at' => $election->start_at
                        ?->toDateTimeString(),

                    'end_at' => $election->end_at
                        ?->toDateTimeString(),
                ]
            );
        });

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()
            ->route('admin.elections.index')
            ->with(
                'success',
                'Election created successfully.'
            )->with('adminAlert', ['title' => 'Election Added', 'message' => 'Election created successfully.', 'type' => 'success']);
    }

    /**
     * Display the specified election.
     *
     * Also provides the eligible voters for this election.
     */
    public function show(
        Election $election,
        ElectionResults $results
    ): Response {

        /*
        |--------------------------------------------------------------------------
        | Eligible voters
        |--------------------------------------------------------------------------
        */

        $eligibleVoters =
            ElectionVoter::query()
                ->with([
                    'voter:id,name,username',
                ])
                ->where(
                    'election_id',
                    $election->id
                )
                ->orderBy('id')
                ->get()
                ->map(function (
                    ElectionVoter $electionVoter
                ) {
                    return [
                        'id' => $electionVoter->id,

                        'voter_id' => $electionVoter->voter_id,

                        'name' => $electionVoter
                            ->voter
                            ?->name,

                        'username' => $electionVoter
                            ->voter
                            ?->username,

                        'created_at' => $electionVoter
                            ->created_at
                            ?->format(
                                'Y-m-d H:i:s'
                            ),
                    ];
                })
                ->values();

        /*
        |--------------------------------------------------------------------------
        | Total eligible voters
        |--------------------------------------------------------------------------
        */

        $eligibleVoterCount = $eligibleVoters->count();

        /*
        |--------------------------------------------------------------------------
        | Voters who have actually voted
        |--------------------------------------------------------------------------
        */

        $resultData = $results->forElection($election);
        $votersWhoVoted = $resultData['participated'];
        $resultsVisible = $election->status === 'Completed';
        $positions = $resultData['positions']->map(fn ($position) => [
            'name' => $position['position'],
            'organization' => $position['organization'],
            'participating' => $position['total_votes'],
            'eligible' => $eligibleVoterCount,
            'progress' => $eligibleVoterCount > 0 ? round($position['total_votes'] / $eligibleVoterCount * 100, 1) : 0,
            'candidates' => $resultsVisible ? $position['candidates']->map(fn ($candidate) => [
                'name' => $candidate['name'],
                'photo' => $candidate['photo'],
                'designation' => $candidate['type'] === 'independent' ? 'Independent' : $candidate['partylist'],
                'votes' => $candidate['votes'],
                'percentage' => $candidate['percentage'],
                'rank' => $candidate['rank'],
                'tied' => $candidate['tied'],
            ]) : [],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Turnout
        |--------------------------------------------------------------------------
        */

        $turnout =
            $eligibleVoterCount > 0
                ? round(
                    (
                        $votersWhoVoted /
                        $eligibleVoterCount
                    ) * 100,
                    1
                )
                : 0;

        return Inertia::render(
            'AdminSide/Elections/Show',
            [
                'election' => [
                    'id' => $election->id,

                    'title' => $election->title,

                    'description' => $election->description,

                    'start_at' => $election->start_at
                        ?->format(
                            'Y-m-d H:i:s'
                        ),

                    'end_at' => $election->end_at
                        ?->format(
                            'Y-m-d H:i:s'
                        ),

                    'status' => $election->status,

                    'created_at' => $election->created_at
                        ?->format(
                            'Y-m-d H:i:s'
                        ),

                    'updated_at' => $election->updated_at
                        ?->format(
                            'Y-m-d H:i:s'
                        ),
                ],

                /*
                |--------------------------------------------------------------------------
                | Eligibility information
                |--------------------------------------------------------------------------
                */

                'eligibleVoters' => $eligibleVoters,

                'eligibleVoterCount' => $eligibleVoterCount,

                'votersWhoVoted' => $votersWhoVoted,

                'turnout' => $turnout,

                'notYetParticipated' => max(0, $eligibleVoterCount - $votersWhoVoted),

                'positions' => $positions,

                'resultsVisible' => $resultsVisible,

                'lastRefreshedAt' => now()->toIso8601String(),
            ]
        );
    }

    /**
     * Show the form for editing the specified election.
     */
    public function edit(
        Election $election
    ): Response {

        return Inertia::render(
            'AdminSide/Elections/Edit',
            [
                'election' => [
                    'id' => $election->id,

                    'title' => $election->title,

                    'description' => $election->description,

                    'start_at' => $election->start_at
                        ?->format(
                            'Y-m-d\TH:i'
                        ),

                    'end_at' => $election->end_at
                        ?->format(
                            'Y-m-d\TH:i'
                        ),

                    'status' => $election->status,
                ],
            ]
        );
    }

    /**
     * Update the specified election.
     */
    public function update(
        UpdateElectionRequest $request,
        Election $election
    ): RedirectResponse|JsonResponse {

        /*
        |--------------------------------------------------------------------------
        | Preserve previous values for audit
        |--------------------------------------------------------------------------
        */

        $oldValues = [
            'title' => $election->title,

            'description' => $election->description,

            'start_at' => $election->start_at
                ?->toDateTimeString(),

            'end_at' => $election->end_at
                ?->toDateTimeString(),
        ];

        DB::transaction(function () use (
            $request,
            $election,
            $oldValues
        ) {

            $election->update([
                'title' => $request->title,

                'description' => $request->description,

                'start_at' => $request->start_at,

                'end_at' => $request->end_at,
            ]);

            $this->logAction(
                'update_election',
                'Updated election: '.
                    $election->title,
                $election,
                [
                    'old' => $oldValues,

                    'new' => [
                        'title' => $election->title,

                        'description' => $election->description,

                        'start_at' => $election->start_at
                            ?->toDateTimeString(),

                        'end_at' => $election->end_at
                            ?->toDateTimeString(),
                    ],
                ]
            );
        });

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()
            ->route('admin.elections.index')
            ->with(
                'success',
                'Election updated successfully.'
            )->with('adminAlert', ['title' => 'Election Updated', 'message' => 'Election updated successfully.', 'type' => 'success']);
    }

    /**
     * Remove the specified election.
     */
    public function destroy(
        Election $election
    ): RedirectResponse|JsonResponse {

        /*
        |--------------------------------------------------------------------------
        | Prevent deleting an ongoing election
        |--------------------------------------------------------------------------
        |
        | This protects voting data from being removed accidentally
        | while voting is active.
        |--------------------------------------------------------------------------
        */

        if ($election->status === 'Ongoing') {
            if (request()->wantsJson()) {
                return response()->json(['success' => false, 'message' => 'An ongoing election cannot be deleted.'], 422);
            }

            return back()
                ->with(
                    'error',
                    'An ongoing election cannot be deleted.'
                );
        }

        $electionTitle =
            $election->title;

        $electionId =
            $election->id;

        DB::transaction(function () use (
            $election,
            $electionTitle,
            $electionId
        ) {

            $this->logAction(
                'delete_election',
                'Deleted election: '.
                    $electionTitle,
                null,
                [
                    'election_id' => $electionId,

                    'title' => $electionTitle,
                ]
            );

            $election->delete();
        });

        if (request()->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()
            ->route('admin.elections.index')
            ->with(
                'success',
                'Election deleted successfully.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | ASSIGN ELIGIBLE VOTERS
    |--------------------------------------------------------------------------
    |
    | POST:
    | /admin/elections/{election}/voters
    |
    | Expected request:
    |
    | voters: [1, 2, 3, 4]
    |
    |--------------------------------------------------------------------------
    */

    public function assignVoters(
        Request $request,
        Election $election
    ): RedirectResponse {

        /*
        |--------------------------------------------------------------------------
        | Do not change eligibility after voting starts
        |--------------------------------------------------------------------------
        */

        if (
            $election->status === 'Ongoing' ||
            $election->status === 'Completed'
        ) {
            return back()
                ->with(
                    'error',
                    'Eligible voters cannot be changed after the election has started.'
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Validate request
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'voters' => [
                'required',
                'array',
                'min:1',
            ],

            'voters.*' => [
                'integer',
                'distinct',
                'exists:users,id',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Make sure selected users are actually voters
        |--------------------------------------------------------------------------
        */

        $voterIds = User::query()
            ->whereIn(
                'id',
                $validated['voters']
            )
            ->where(
                'role',
                'voter'
            )
            ->pluck('id')
            ->values();

        if ($voterIds->isEmpty()) {
            return back()
                ->with(
                    'error',
                    'No valid voter accounts were selected.'
                );
        }

        DB::transaction(function () use (
            $election,
            $voterIds
        ) {

            /*
            |--------------------------------------------------------------------------
            | Insert only voters that are not already assigned.
            |--------------------------------------------------------------------------
            */

            $existingIds =
                ElectionVoter::query()
                    ->where(
                        'election_id',
                        $election->id
                    )
                    ->whereIn(
                        'voter_id',
                        $voterIds
                    )
                    ->pluck('voter_id');

            $newVoterIds =
                $voterIds
                    ->diff($existingIds)
                    ->values();

            foreach ($newVoterIds as $voterId) {

                ElectionVoter::create([
                    'election_id' => $election->id,

                    'voter_id' => $voterId,
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Audit
            |--------------------------------------------------------------------------
            */

            $this->logAction(
                'assign_election_voters',
                'Assigned eligible voters to election: '.
                    $election->title,
                $election,
                [
                    'assigned_count' => $newVoterIds->count(),

                    'voter_ids' => $newVoterIds->values()->all(),
                ]
            );
        });

        return back()
            ->with(
                'success',
                'Eligible voters assigned successfully.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | REMOVE AN ELIGIBLE VOTER
    |--------------------------------------------------------------------------
    */

    public function removeVoter(
        Election $election,
        User $voter
    ): RedirectResponse {

        /*
        |--------------------------------------------------------------------------
        | Validate that this account is actually a voter
        |--------------------------------------------------------------------------
        */

        if ($voter->role !== 'voter') {
            return back()
                ->with(
                    'error',
                    'The selected account is not a voter.'
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Do not modify eligibility after election starts
        |--------------------------------------------------------------------------
        */

        if (
            $election->status === 'Ongoing' ||
            $election->status === 'Completed'
        ) {
            return back()
                ->with(
                    'error',
                    'Eligible voters cannot be changed after the election has started.'
                );
        }

        $electionVoter =
            ElectionVoter::query()
                ->where(
                    'election_id',
                    $election->id
                )
                ->where(
                    'voter_id',
                    $voter->id
                )
                ->first();

        if (! $electionVoter) {
            return back()
                ->with(
                    'error',
                    'This voter is not assigned to the election.'
                );
        }

        DB::transaction(function () use (
            $election,
            $voter,
            $electionVoter
        ) {

            $electionVoter->delete();

            $this->logAction(
                'remove_election_voter',
                'Removed voter eligibility from election: '.
                    $election->title,
                $election,
                [
                    'voter_id' => $voter->id,

                    /*
                    |--------------------------------------------------------------------------
                    | We record the account identity for the
                    | administrative eligibility action.
                    |
                    | This is NOT a vote choice.
                    |--------------------------------------------------------------------------
                    */

                    'voter_username' => $voter->username,
                ]
            );
        });

        return back()
            ->with(
                'success',
                'Voter removed from the election successfully.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | AUDIT LOG HELPER
    |--------------------------------------------------------------------------
    */

    private function logAction(
        string $action,
        string $description,
        ?Election $election = null,
        array $metadata = []
    ): void {

        AuditLog::create([
            'user_id' => auth()->id(),

            'action' => $action,

            'description' => $description,

            'auditable_type' => $election
                    ? Election::class
                    : null,

            'auditable_id' => $election?->id,

            'ip_address' => request()->ip(),

            'user_agent' => request()->userAgent(),

            'metadata' => $metadata,
        ]);
    }
}
