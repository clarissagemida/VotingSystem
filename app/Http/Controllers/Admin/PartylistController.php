<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\Election;
use App\Models\Organization;
use App\Models\Partylist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PartylistController extends Controller
{
    /**
     * Validation rules shared by store() and update().
     *
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'election_id' => [
                'required',
                'exists:elections,id',
            ],

            'organization_id' => [
                'required',
                'exists:organizations,id',
            ],

            'partylist_name' => [
                'required',
                'string',
                'max:255',
            ],

            'acronym' => [
                'required',
                'string',
                'max:50',
            ],

            'color' => [
                'required',
                'string',
                'max:20',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'logo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],

            'banner' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:4096',
            ],
        ];
    }

    /**
     * Store an uploaded logo on the public disk.
     */
    private function storeLogo(Request $request, array &$validated): void
    {
        if ($request->hasFile('logo')) {
            $validated['logo'] = $request
                ->file('logo')
                ->store('partylists/logos', 'public');
        }
    }

    /**
     * Store an uploaded banner on the public disk.
     */
    private function storeBanner(Request $request, array &$validated): void
    {
        if ($request->hasFile('banner')) {
            $validated['banner'] = $request
                ->file('banner')
                ->store('partylists/banners', 'public');
        }
    }

    /**
     * The elections and organizations needed by the partylist forms.
     *
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'elections' => Election::orderBy('id', 'desc')->get(),

            'organizations' => Organization::with('positions')
                ->orderBy('name', 'asc')
                ->get(),
        ];
    }

    /**
     * List all partylists.
     */
    public function index(): Response
    {
        $partylists = Partylist::with([
            'election',
            'organization.positions',
            'candidates',
        ])
            ->withCount('candidates')
            ->latest()
            ->get();

        $independentCandidatesCount = Candidate::whereNull('partylist_id')
            ->count();

        return Inertia::render('AdminSide/Partylists/Index', [
            ...$this->formOptions(),
            'partylists' => $partylists,
            'independentCandidatesCount' => $independentCandidatesCount,
        ]);
    }

    /**
     * Show the form for creating a new partylist.
     */
    public function create(): Response
    {
        return Inertia::render(
            'AdminSide/Partylists/Create',
            $this->formOptions()
        );
    }

    /**
     * Persist a new partylist.
     */
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate($this->rules());

        $this->storeLogo($request, $validated);
        $this->storeBanner($request, $validated);

        Partylist::create($validated);

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()
            ->route('admin.partylists.index')
            ->with('success', 'Partylist created successfully.');
    }

    /**
     * Show a single partylist.
     */
    public function show(Partylist $partylist): Response
    {
        $partylist->load(['election', 'organization.positions', 'candidates']);

        return Inertia::render('AdminSide/Partylists/Show', [
            'partylist' => $partylist,
        ]);
    }

    /**
     * Show the form for editing a partylist.
     */
    public function edit(Partylist $partylist): Response
    {
        $partylist->load(['election', 'organization']);

        return Inertia::render('AdminSide/Partylists/Edit', [
            ...$this->formOptions(),
            'partylist' => $partylist,
        ]);
    }

    /**
     * Update an existing partylist.
     */
    public function update(
        Request $request,
        Partylist $partylist
    ): RedirectResponse|JsonResponse {
        $validated = $request->validate($this->rules());

        if ($request->hasFile('logo')) {
            if ($partylist->logo) {
                Storage::disk('public')->delete($partylist->logo);
            }

            $this->storeLogo($request, $validated);
        } else {
            unset($validated['logo']);
        }

        if ($request->hasFile('banner')) {
            if ($partylist->banner) {
                Storage::disk('public')->delete($partylist->banner);
            }

            $this->storeBanner($request, $validated);
        } else {
            unset($validated['banner']);
        }

        $partylist->update($validated);

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()
            ->route('admin.partylists.index')
            ->with('success', 'Partylist updated successfully.');
    }

    /**
     * Delete a partylist and its uploaded files.
     */
    public function destroy(Partylist $partylist): RedirectResponse|JsonResponse
    {
        if ($partylist->logo) {
            Storage::disk('public')->delete($partylist->logo);
        }

        if ($partylist->banner) {
            Storage::disk('public')->delete($partylist->banner);
        }

        $partylist->delete();

        if (request()->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()
            ->route('admin.partylists.index')
            ->with('success', 'Partylist deleted successfully.');
    }
}
