<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreOrganizationRequest;
use App\Http\Requests\Admin\UpdateOrganizationRequest;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    /**
     * The standard position sets for each organization type.
     *
     * @return array<int, string>
     */
    private function getPositions(string $type): array
    {
        return match ($type) {
            'SSG' => [
                'President',
                'Vice President',
                'Senator 1',
                'Senator 2',
                'Senator 3',
                'Senator 4',
                'Senator 5',
                'Senator 6',
                'Senator 7',
                'Senator 8',
                'Senator 9',
                'Senator 10',
            ],

            'FLP' => [
                'President',
                'Vice President',
                'Secretary',
                'General Secretary',
                'Treasurer',
                'Auditor',
                'Business Manager',
                'Public Relation Officer',
                'Speaker of the House',
                'Deputy Speaker of the House',
                'Sentinel',
                'Muse',
            ],

            'OTHER' => [
                'President',
                'Vice President',
                'Secretary',
                'Treasurer',
                'Auditor',
                'Business Manager',
                'PIO',
                'Sergeant at Arms',
                'Muse',
                'Escort',
            ],

            default => [],
        };
    }

    /**
     * Resolve the organization name for a given type.
     *
     * SSG and FLP use fixed names, every other type keeps the
     * admin-provided name.
     */
    private function resolveName(string $type, ?string $name): ?string
    {
        return match ($type) {
            'SSG' => 'Supreme Student Government',
            'FLP' => 'Future Leader of the Philippines',
            default => $name,
        };
    }

    /**
     * List all organizations.
     */
    public function index(): Response
    {
        $organizations = Organization::with('positions')
            ->orderBy('name')
            ->get();

        return Inertia::render('AdminSide/Organizations/Index', [
            'organizations' => $organizations,
        ]);
    }

    /**
     * Show the form for creating a new organization.
     */
    public function create(): Response
    {
        return Inertia::render('AdminSide/Organizations/Create');
    }

    /**
     * Persist a new organization and its positions.
     */
    public function store(StoreOrganizationRequest $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validated();

        $validated['name'] = $this->resolveName(
            $validated['type'],
            $validated['name'] ?? null
        );

        DB::transaction(function () use ($validated) {
            $organization = Organization::create([
                'name' => $validated['name'],
                'type' => $validated['type'],
            ]);

            foreach ($this->getPositions($validated['type']) as $index => $position) {
                $organization->positions()->create([
                    'position_name' => $position,
                    'position_order' => $index + 1,
                ]);
            }
        });

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()
            ->route('admin.organizations.index')
            ->with('organizationCreated', $validated['name'].' created successfully.');
    }

    /**
     * Show a single organization with its positions.
     */
    public function show(Organization $organization): Response
    {
        $organization->load('positions');

        return Inertia::render('AdminSide/Organizations/Show', [
            'organization' => $organization,
        ]);
    }

    /**
     * Show the form for editing an organization.
     */
    public function edit(Organization $organization): Response|JsonResponse
    {
        $organization->load('positions');

        if (request()->wantsJson()) {
            return response()->json([
                'id' => $organization->id,
                'name' => $organization->name,
                'type' => $organization->type,
                'positions' => $organization->positions,
            ]);
        }

        return Inertia::render('AdminSide/Organizations/Edit', [
            'organization' => $organization,
        ]);
    }

    /**
     * Update an organization and rebuild its positions.
     */
    public function update(
        UpdateOrganizationRequest $request,
        Organization $organization
    ): RedirectResponse|JsonResponse {
        $validated = $request->validated();

        $validated['name'] = $this->resolveName(
            $validated['type'],
            $validated['name'] ?? null
        );

        DB::transaction(function () use ($organization, $validated) {
            $organization->update([
                'name' => $validated['name'],
                'type' => $validated['type'],
            ]);

            $organization->positions()->delete();

            foreach ($this->getPositions($validated['type']) as $index => $position) {
                $organization->positions()->create([
                    'position_name' => $position,
                    'position_order' => $index + 1,
                ]);
            }
        });

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()
            ->route('admin.organizations.index')
            ->with('organizationUpdated', $validated['name'].' updated successfully.');
    }

    /**
     * Delete an organization.
     *
     * Positions are removed automatically through cascadeOnDelete().
     */
    public function destroy(Organization $organization): RedirectResponse|JsonResponse
    {
        $orgName = $organization->name;
        $organization->delete();

        if (request()->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()
            ->route('admin.organizations.index')
            ->with('organizationDeleted', $orgName.' deleted successfully.');
    }
}
