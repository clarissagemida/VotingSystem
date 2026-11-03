<?php

namespace App\Http\Controllers\Voter;

use App\Http\Controllers\Controller;
use App\Support\VoterNotifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the voter's profile page.
     */
    public function index(): Response
    {
        $user = auth()->user();

        return Inertia::render('VoterSide/Profile/Index', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * Update the voter's profile information (name, username, email).
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-Z0-9._]+$/',
                Rule::unique('users')->ignore($request->user()->id),
            ],
            'email' => [
                'nullable',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($request->user()->id),
            ],
        ]);

        $user = $request->user();
        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        VoterNotifier::record([
            'action' => 'profile_updated',
            'title' => 'Profile Updated',
            'message' => $user->name.' updated their profile information.',
            'voter_name' => $user->name,
        ]);

        return back();
    }

    /**
     * Update the voter's password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        VoterNotifier::record([
            'action' => 'password_changed',
            'title' => 'Password Changed',
            'message' => $user->name.' changed their account password.',
            'voter_name' => $user->name,
        ]);

        return back();
    }
}
