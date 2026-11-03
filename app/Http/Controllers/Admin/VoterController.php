<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreVoterRequest;
use App\Http\Requests\Admin\UpdateVoterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class VoterController extends Controller
{
    /**
     * Display all voters.
     */
    public function index(): Response
    {
        $voters = User::query()
            ->where('role', 'voter')
            ->orderBy('name')
            ->get()
            ->map(function (User $voter) {
                return [
                    'id' => $voter->id,
                    'name' => $voter->name,
                    'username' => $voter->username,
                    'created_at' => $voter->created_at?->toDateTimeString(),
                ];
            })
            ->values();

        return Inertia::render('AdminSide/Voters/Index', [
            'voters' => $voters,
        ]);
    }

    /**
     * Show the form for creating a new voter.
     */
    public function create(): Response
    {
        return Inertia::render('AdminSide/Voters/Create');
    }

    /**
     * Show the form for editing a voter.
     */
    public function edit(User $voter): Response|JsonResponse
    {
        if ($voter->role !== 'voter') {
            abort(403, 'Only voter accounts can be edited.');
        }

        if (request()->wantsJson()) {
            return response()->json([
                'id' => $voter->id,
                'name' => $voter->name,
                'username' => $voter->username,
            ]);
        }

        return Inertia::render('AdminSide/Voters/Edit', [
            'voter' => [
                'id' => $voter->id,
                'name' => $voter->name,
                'username' => $voter->username,
            ],
        ]);
    }

    /**
     * Create a new voter.
     *
     * IMPORTANT:
     * The username and password generated in the React
     * Create Voter modal are used directly here.
     */
    public function store(StoreVoterRequest $request): RedirectResponse|JsonResponse
    {
        $username = $request->username;
        $password = $request->password;

        $voter = User::create([
            'name' => $request->name,
            'username' => $username,
            'password' => $password,
            'role' => 'voter',
            'email' => null,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'voter' => [
                    'name' => $voter->name,
                    'username' => $username,
                    'password' => $password,
                ],
            ]);
        }

        return redirect()
            ->route('admin.voters.index')
            ->with('voterCreated', [
                'name' => $voter->name,
                'username' => $username,
                'password' => $password,
            ])
            ->with('adminAlert', ['title' => 'Voter Added', 'message' => $voter->name.' was added successfully.', 'type' => 'success']);
    }

    /**
     * Update voter.
     */
    public function update(
        UpdateVoterRequest $request,
        User $voter
    ): RedirectResponse|JsonResponse {
        if ($voter->role !== 'voter') {
            abort(403, 'Only voter accounts can be updated.');
        }

        $validated = $request->validated();

        $voter->name = $validated['name'];
        $voter->username = $validated['username'];

        $voter->save();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'voter' => $voter->name,
            ]);
        }

        return redirect()
            ->route('admin.voters.index')
            ->with('voterUpdated', $voter->name)
            ->with('adminAlert', ['title' => 'Voter Updated', 'message' => $voter->name.' was updated successfully.', 'type' => 'success']);
    }

    public function destroy(User $voter): RedirectResponse|JsonResponse
    {
        if ($voter->role !== 'voter') {
            abort(403, 'Only voter accounts can be deleted.');
        }

        $name = $voter->name;

        $voter->delete();

        if (request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'voter' => $name,
            ]);
        }

        return redirect()
            ->route('admin.voters.index')
            ->with('voterDeleted', $name)
            ->with('adminAlert', ['title' => 'Voter Deleted', 'message' => $name.' was deleted successfully.', 'type' => 'success']);
    }

    /**
     * Reset voter password.
     */
    public function resetPassword(User $voter): RedirectResponse|JsonResponse
    {
        if ($voter->role !== 'voter') {
            abort(403, 'Only voter accounts can be reset.');
        }

        $password = User::generatePassword();

        // The User model uses the "hashed" cast.
        $voter->update([
            'password' => $password,
        ]);

        if (request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'name' => $voter->name,
                'username' => $voter->username,
                'password' => $password,
            ]);
        }

        return redirect()
            ->route('admin.voters.index')
            ->with('passwordReset', [
                'name' => $voter->name,
                'username' => $voter->username,
                'password' => $password,
            ]);
    }
}
