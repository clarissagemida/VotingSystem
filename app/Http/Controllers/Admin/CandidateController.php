<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\Election;
use App\Models\Organization;
use App\Models\Partylist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CandidateController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | PARTYLIST CANDIDATES
    |--------------------------------------------------------------------------
    */

    public function index(Partylist $partylist)
    {
        $partylist->load([
            'election',
            'organization.positions',
        ]);

        $candidates = Candidate::where(
            'partylist_id',
            $partylist->id
        )
            ->orderBy('id')
            ->get();

        return Inertia::render(
            'AdminSide/Partylists/Candidates/Index',
            [
                'partylist' => $partylist,
                'candidates' => $candidates,
                'positions' => $this->positionsFor($partylist),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE PARTYLIST CANDIDATE
    |--------------------------------------------------------------------------
    */

    public function create(Partylist $partylist)
    {
        $partylist->load(['election', 'organization.positions']);

        return Inertia::render(
            'AdminSide/Partylists/Candidates/Create',
            [
                'partylist' => $partylist,
                'positions' => $this->positionsFor($partylist),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | EDIT PARTYLIST CANDIDATE
    |--------------------------------------------------------------------------
    */

    public function edit(
        Partylist $partylist,
        Candidate $candidate
    ) {
        abort_unless(
            (int) $candidate->partylist_id ===
                (int) $partylist->id,
            404
        );

        $partylist->load(['election', 'organization.positions']);

        return Inertia::render(
            'AdminSide/Partylists/Candidates/Edit',
            [
                'partylist' => $partylist,
                'candidate' => $candidate,
                'positions' => $this->positionsFor($partylist),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | POSITIONS FOR A PARTYLIST
    |--------------------------------------------------------------------------
    */

    private function positionsFor(Partylist $partylist): array
    {
        return $partylist->organization?->positions
            ?->sortBy('position_order')
            ->values()
            ->map(function ($position) {
                return [
                    'id' => $position->id,
                    'position_name' => $position->position_name,
                    'position_order' => $position->position_order,
                ];
            })
            ->toArray() ?? [];
    }

    /*
    |--------------------------------------------------------------------------
    | STORE PARTYLIST CANDIDATE
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request,
        Partylist $partylist
    ) {
        $validated = $request->validate([
            'candidate_name' => [
                'required',
                'string',
                'max:255',
            ],

            'position_name' => [
                'required',
                'string',
                'max:255',
            ],

            'photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:4096',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | CHECK ORGANIZATION
        |--------------------------------------------------------------------------
        */

        $organization = $partylist
            ->organization()
            ->with('positions')
            ->first();

        if (! $organization) {
            return back()->withErrors([
                'position_name' => 'This partylist has no organization assigned.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | CHECK POSITION
        |--------------------------------------------------------------------------
        */

        $validPosition = $organization->positions
            ->contains(
                'position_name',
                $validated['position_name']
            );

        if (! $validPosition) {
            return back()->withErrors([
                'position_name' => 'The selected position is not available for this organization.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | PREVENT DUPLICATE POSITION
        |--------------------------------------------------------------------------
        */

        $positionExists = Candidate::where(
            'partylist_id',
            $partylist->id
        )
            ->where(
                'position_name',
                $validated['position_name']
            )
            ->exists();

        if ($positionExists) {
            return back()->withErrors([
                'position_name' => 'This position already has a candidate.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | PHOTO
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('photo')) {

            $validated['photo'] = $request
                ->file('photo')
                ->store(
                    'candidates',
                    'public'
                );

        } else {

            $validated['photo'] = null;

        }

        /*
        |--------------------------------------------------------------------------
        | PARTYLIST ID
        |--------------------------------------------------------------------------
        */

        $validated['partylist_id'] = $partylist->id;

        /*
        |--------------------------------------------------------------------------
        | INHERIT ELECTION
        |--------------------------------------------------------------------------
        |
        | The candidate belongs to the same election
        | as the partylist.
        |
        */

        $validated['election_id'] =
            $partylist->election_id;

        /*
        |--------------------------------------------------------------------------
        | INHERIT ORGANIZATION
        |--------------------------------------------------------------------------
        |
        | The candidate belongs to the same organization
        | as the partylist.
        |
        */

        $validated['organization_id'] =
            $partylist->organization_id;

        /*
        |--------------------------------------------------------------------------
        | CANDIDATE TYPE
        |--------------------------------------------------------------------------
        */

        $validated['candidate_type'] = 'partylist';

        /*
        |--------------------------------------------------------------------------
        | CREATE
        |--------------------------------------------------------------------------
        */

        Candidate::create($validated);

        return redirect()
            ->route('admin.partylists.candidates.index', $partylist)
            ->with('success', 'Candidate added successfully.');
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE PARTYLIST CANDIDATE
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        Partylist $partylist,
        Candidate $candidate
    ) {
        abort_unless(
            (int) $candidate->partylist_id ===
                (int) $partylist->id,
            404
        );

        $validated = $request->validate([
            'candidate_name' => [
                'required',
                'string',
                'max:255',
            ],

            'position_name' => [
                'required',
                'string',
                'max:255',
            ],

            'photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:4096',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | CHECK ORGANIZATION
        |--------------------------------------------------------------------------
        */

        $organization = $partylist
            ->organization()
            ->with('positions')
            ->first();

        if (! $organization) {
            return back()->withErrors([
                'position_name' => 'This partylist has no organization.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | CHECK POSITION
        |--------------------------------------------------------------------------
        */

        $validPosition = $organization->positions
            ->contains(
                'position_name',
                $validated['position_name']
            );

        if (! $validPosition) {
            return back()->withErrors([
                'position_name' => 'The selected position is not available.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | PREVENT DUPLICATE
        |--------------------------------------------------------------------------
        */

        $duplicate = Candidate::where(
            'partylist_id',
            $partylist->id
        )
            ->where(
                'position_name',
                $validated['position_name']
            )
            ->where(
                'id',
                '!=',
                $candidate->id
            )
            ->exists();

        if ($duplicate) {
            return back()->withErrors([
                'position_name' => 'This position already has another candidate.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | PHOTO
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('photo')) {

            if ($candidate->photo) {
                Storage::disk('public')->delete(
                    $candidate->photo
                );
            }

            $validated['photo'] = $request
                ->file('photo')
                ->store(
                    'candidates',
                    'public'
                );
        }

        /*
        |--------------------------------------------------------------------------
        | KEEP PARTYLIST RELATIONSHIPS
        |--------------------------------------------------------------------------
        */

        $validated['partylist_id'] =
            $partylist->id;

        $validated['election_id'] =
            $partylist->election_id;

        $validated['organization_id'] =
            $partylist->organization_id;

        $validated['candidate_type'] =
            'partylist';

        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        $candidate->update($validated);

        return redirect()
            ->route('admin.partylists.candidates.index', $partylist)
            ->with('success', 'Candidate updated successfully.');
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE PARTYLIST CANDIDATE
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Partylist $partylist,
        Candidate $candidate
    ) {
        abort_unless(
            (int) $candidate->partylist_id ===
                (int) $partylist->id,
            404
        );

        if ($candidate->photo) {

            Storage::disk('public')->delete(
                $candidate->photo
            );

        }

        $candidate->delete();

        return back()->with(
            'success',
            'Candidate deleted successfully.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | BULK STORE PARTYLIST CANDIDATES
    |--------------------------------------------------------------------------
    */

    public function bulkStore(
        Request $request,
        Partylist $partylist
    ) {
        $validated = $request->validate([
            'candidates' => [
                'required',
                'array',
                'min:1',
            ],

            'candidates.*.candidate_name' => [
                'required',
                'string',
                'max:255',
            ],

            'candidates.*.position_name' => [
                'required',
                'string',
                'max:255',
            ],

            'candidates.*.photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:4096',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | ORGANIZATION
        |--------------------------------------------------------------------------
        */

        $organization = $partylist
            ->organization()
            ->with('positions')
            ->first();

        if (! $organization) {
            return back()->withErrors([
                'candidates' => 'This partylist has no organization.',
            ]);
        }

        DB::transaction(function () use (
            $request,
            $validated,
            $partylist,
            $organization
        ) {

            foreach (
                $validated['candidates'] as $index => $candidateData
            ) {

                $position =
                    $candidateData['position_name'];

                /*
                |--------------------------------------------------------------------------
                | VALID POSITION
                |--------------------------------------------------------------------------
                */

                $validPosition =
                    $organization->positions->contains(
                        'position_name',
                        $position
                    );

                if (! $validPosition) {
                    abort(
                        422,
                        "Invalid position: {$position}"
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | DUPLICATE POSITION
                |--------------------------------------------------------------------------
                */

                $exists = Candidate::where(
                    'partylist_id',
                    $partylist->id
                )
                    ->where(
                        'position_name',
                        $position
                    )
                    ->exists();

                if ($exists) {
                    abort(
                        422,
                        "Position already filled: {$position}"
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | PHOTO
                |--------------------------------------------------------------------------
                */

                $photoPath = null;

                if (
                    $request->hasFile(
                        "candidates.{$index}.photo"
                    )
                ) {

                    $photoPath = $request
                        ->file(
                            "candidates.{$index}.photo"
                        )
                        ->store(
                            'candidates',
                            'public'
                        );
                }

                /*
                |--------------------------------------------------------------------------
                | CREATE
                |--------------------------------------------------------------------------
                */

                Candidate::create([
                    'partylist_id' => $partylist->id,

                    'election_id' => $partylist->election_id,

                    'organization_id' => $partylist->organization_id,

                    'candidate_type' => 'partylist',

                    'candidate_name' => trim(
                        $candidateData[
                            'candidate_name'
                        ]
                    ),

                    'position_name' => $position,

                    'photo' => $photoPath,
                ]);
            }
        });

        return back()->with(
            'success',
            'Full partylist candidates added successfully.'
        );
    }

    // ========================================================================
    // INDEPENDENT CANDIDATES
    // ========================================================================

    /*
    |--------------------------------------------------------------------------
    | INDEPENDENT INDEX
    |--------------------------------------------------------------------------
    */

    public function independentIndex()
    {
        /*
        |--------------------------------------------------------------------------
        | GET ONLY INDEPENDENT CANDIDATES
        |
        | partylist_id = NULL means the candidate is independent.
        |--------------------------------------------------------------------------
        */

        $candidates = Candidate::whereNull(
            'partylist_id'
        )
            ->with(['election', 'organization'])
            ->orderBy('id')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | GET ELECTIONS
        |--------------------------------------------------------------------------
        */

        $elections = $this->electionOptions();

        /*
        |--------------------------------------------------------------------------
        | GET ORGANIZATIONS AND POSITIONS
        |--------------------------------------------------------------------------
        */

        $organizations = $this->organizationOptions();

        return Inertia::render(
            'AdminSide/Partylists/Candidates/Independent',
            [
                'candidates' => $candidates,

                'elections' => $elections,

                'organizations' => $organizations,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE INDEPENDENT CANDIDATE
    |--------------------------------------------------------------------------
    */

    public function independentCreate()
    {
        return Inertia::render(
            'AdminSide/Partylists/Candidates/IndependentCreate',
            [
                'elections' => $this->electionOptions(),
                'organizations' => $this->organizationOptions(),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | EDIT INDEPENDENT CANDIDATE
    |--------------------------------------------------------------------------
    */

    public function independentEdit(Candidate $candidate)
    {
        abort_unless(
            is_null($candidate->partylist_id),
            404
        );

        return Inertia::render(
            'AdminSide/Partylists/Candidates/IndependentEdit',
            [
                'candidate' => $candidate,
                'elections' => $this->electionOptions(),
                'organizations' => $this->organizationOptions(),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ELECTION OPTIONS
    |--------------------------------------------------------------------------
    */

    private function electionOptions(): array
    {
        return Election::orderBy('start_at', 'desc')
            ->get(['id', 'title'])
            ->toArray();
    }

    /*
    |--------------------------------------------------------------------------
    | ORGANIZATION OPTIONS (WITH POSITIONS)
    |--------------------------------------------------------------------------
    */

    private function organizationOptions(): array
    {
        return Organization::with([
            'positions' => function ($query) {
                $query->orderBy('position_order');
            },
        ])
            ->orderBy('name')
            ->get()
            ->map(function ($organization) {
                return [
                    'id' => $organization->id,
                    'name' => $organization->name,

                    'positions' => $organization->positions
                        ->map(function ($position) {
                            return [
                                'id' => $position->id,
                                'position_name' => $position->position_name,
                                'position_order' => $position->position_order,
                            ];
                        })
                        ->values()
                        ->toArray(),
                ];
            })
            ->values()
            ->toArray();
    }

    /*
    |--------------------------------------------------------------------------
    | STORE INDEPENDENT CANDIDATE
    |--------------------------------------------------------------------------
    */

    public function independentStore(
        Request $request
    ) {
        $validated = $request->validate([
            'candidate_name' => [
                'required',
                'string',
                'max:255',
            ],

            'position_name' => [
                'required',
                'string',
                'max:255',
            ],

            'photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:4096',
            ],

            'election_id' => [
                'nullable',
                'integer',
                'exists:elections,id',
            ],

            'organization_id' => [
                'required',
                'integer',
                'exists:organizations,id',
            ],

            'platform' => [
                'nullable',
                'string',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | PREVENT DUPLICATE INDEPENDENT POSITION
        |--------------------------------------------------------------------------
        |
        | Same position can exist in another election or organization.
        |
        */

        $positionExists = Candidate::whereNull(
            'partylist_id'
        )
            ->where(
                'election_id',
                $validated['election_id']
            )
            ->where(
                'organization_id',
                $validated['organization_id']
            )
            ->where(
                'position_name',
                $validated['position_name']
            )
            ->exists();

        if ($positionExists) {

            return back()->withErrors([
                'position_name' => 'This position already has an independent candidate.',
            ]);

        }

        /*
        |--------------------------------------------------------------------------
        | PHOTO
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('photo')) {

            $validated['photo'] = $request
                ->file('photo')
                ->store(
                    'candidates',
                    'public'
                );

        } else {

            $validated['photo'] = null;

        }

        /*
        |--------------------------------------------------------------------------
        | NORMALIZE OPTIONAL RELATIONS
        |--------------------------------------------------------------------------
        */

        $validated['election_id'] =
            $validated['election_id'] ?? null;

        $validated['organization_id'] =
            $validated['organization_id'] ?? null;

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |
        | Independent candidates DO NOT have a partylist.
        |--------------------------------------------------------------------------
        */

        $validated['partylist_id'] = null;

        /*
        |--------------------------------------------------------------------------
        | INDEPENDENT TYPE
        |--------------------------------------------------------------------------
        */

        $validated['candidate_type'] = 'independent';

        /*
        |--------------------------------------------------------------------------
        | CREATE
        |--------------------------------------------------------------------------
        */

        Candidate::create($validated);

        return redirect()
            ->route('admin.independent-candidates.index')
            ->with('success', 'Independent candidate added successfully.');
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE INDEPENDENT CANDIDATE
    |--------------------------------------------------------------------------
    */

    public function independentUpdate(
        Request $request,
        Candidate $candidate
    ) {
        /*
        |--------------------------------------------------------------------------
        | MAKE SURE THIS IS REALLY AN INDEPENDENT CANDIDATE
        |--------------------------------------------------------------------------
        */

        abort_unless(
            is_null($candidate->partylist_id),
            404
        );

        $validated = $request->validate([
            'candidate_name' => [
                'required',
                'string',
                'max:255',
            ],

            'position_name' => [
                'required',
                'string',
                'max:255',
            ],

            'photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:4096',
            ],

            'election_id' => [
                'nullable',
                'integer',
                'exists:elections,id',
            ],

            'organization_id' => [
                'required',
                'integer',
                'exists:organizations,id',
            ],

            'platform' => [
                'nullable',
                'string',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | PREVENT DUPLICATE POSITION
        |--------------------------------------------------------------------------
        */

        $duplicate = Candidate::whereNull(
            'partylist_id'
        )
            ->where(
                'election_id',
                $validated['election_id']
            )
            ->where(
                'organization_id',
                $validated['organization_id']
            )
            ->where(
                'position_name',
                $validated['position_name']
            )
            ->where(
                'id',
                '!=',
                $candidate->id
            )
            ->exists();

        if ($duplicate) {

            return back()->withErrors([
                'position_name' => 'This position already has another independent candidate.',
            ]);

        }

        /*
        |--------------------------------------------------------------------------
        | PHOTO
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('photo')) {

            if ($candidate->photo) {

                Storage::disk('public')->delete(
                    $candidate->photo
                );

            }

            $validated['photo'] = $request
                ->file('photo')
                ->store(
                    'candidates',
                    'public'
                );
        }

        /*
        |--------------------------------------------------------------------------
        | NORMALIZE OPTIONAL RELATIONS
        |--------------------------------------------------------------------------
        */

        $validated['election_id'] =
            $validated['election_id'] ?? null;

        $validated['organization_id'] =
            $validated['organization_id'] ?? null;

        /*
        |--------------------------------------------------------------------------
        | KEEP PARTYLIST NULL
        |--------------------------------------------------------------------------
        */

        $validated['partylist_id'] = null;

        /*
        |--------------------------------------------------------------------------
        | KEEP INDEPENDENT TYPE
        |--------------------------------------------------------------------------
        */

        $validated['candidate_type'] = 'independent';

        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        $candidate->update($validated);

        return redirect()
            ->route('admin.independent-candidates.index')
            ->with('success', 'Independent candidate updated successfully.');
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE INDEPENDENT CANDIDATE
    |--------------------------------------------------------------------------
    */

    public function independentDestroy(
        Candidate $candidate
    ) {
        /*
        |--------------------------------------------------------------------------
        | MAKE SURE THIS IS REALLY AN INDEPENDENT CANDIDATE
        |--------------------------------------------------------------------------
        */

        abort_unless(
            is_null($candidate->partylist_id),
            404
        );

        /*
        |--------------------------------------------------------------------------
        | DELETE PHOTO
        |--------------------------------------------------------------------------
        */

        if ($candidate->photo) {

            Storage::disk('public')->delete(
                $candidate->photo
            );

        }

        /*
        |--------------------------------------------------------------------------
        | DELETE CANDIDATE
        |--------------------------------------------------------------------------
        */

        $candidate->delete();

        return back()->with(
            'success',
            'Independent candidate deleted successfully.'
        );
    }
}
