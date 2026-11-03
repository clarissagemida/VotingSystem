<?php

use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\CandidateController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ElectionController;
use App\Http\Controllers\Admin\LiveVotingController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\OrganizationController;
use App\Http\Controllers\Admin\PartylistController;
use App\Http\Controllers\Admin\VoterController;
use App\Http\Controllers\PublicLiveResultsController;
use App\Http\Controllers\Voter\ProfileController;
use App\Http\Controllers\Voter\VoteHistoryController;
use App\Http\Controllers\Voter\VoterDashboardController;
use App\Http\Controllers\Voter\VotingController;
use App\Models\Election;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// guest routes

Route::middleware('guest')->group(function () {

    Route::get('/', function () {
        $elections = Election::query()
            ->orderBy('start_at')
            ->get(['id', 'title', 'start_at', 'end_at'])
            ->filter(fn ($election) => in_array($election->status, ['Upcoming', 'Ongoing'], true))
            ->map(fn ($election) => [
                'id' => $election->id,
                'title' => $election->title,
                'status' => $election->status,
                'start_at' => $election->start_at?->toIso8601String(),
                'end_at' => $election->end_at?->toIso8601String(),
                'organizations' => $election->partylists()->with('organization:id,name')->get()->pluck('organization.name')->filter()->unique()->values(),
            ])->values();

        return Inertia::render('auth/login', [
            'loginType' => 'voter',
            'showcaseElections' => $elections,
        ]);
    })->name('home');

});

Route::get('/live-results/{election}', [PublicLiveResultsController::class, 'show'])
    ->name('public.live-results');

// dashboard route for default auth redirects (compatibility)

Route::middleware(['auth'])->get('/dashboard', function () {
    $user = auth()->user();

    if ($user && $user->role === 'admin') {
        return redirect()->route('admin.dashboard');
    }

    if ($user && $user->role === 'voter') {
        return redirect()->route('voter.dashboard');
    }

    // For compatibility with tests
    return response('OK', 200);
})->name('dashboard');

// authentication check

Route::get('/auth/check', function () {

    return response()
        ->json([
            'authenticated' => auth()->check(),
        ])
        ->header(
            'Cache-Control',
            'no-store, no-cache, must-revalidate, max-age=0, private'
        )
        ->header(
            'Pragma',
            'no-cache'
        )
        ->header(
            'Expires',
            '0'
        );

})->name('auth.check');

Route::middleware(['auth', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        // admin dashboard route

        Route::get('/', [DashboardController::class, 'index'])
            ->name('dashboard');

        // admin analytics route

        Route::get(
            '/analytics',
            [AnalyticsController::class, 'index']
        )->name('analytics.index');

        Route::get('/live-voting', [LiveVotingController::class, 'index'])
            ->name('live-voting.index');

        // admin notification routes

        Route::get('/notifications', [NotificationController::class, 'index'])
            ->name('notifications.index');

        Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead'])
            ->name('notifications.mark-all-read');

        Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead'])
            ->name('notifications.mark-read');

        // voter management routes

        Route::get('/voters', [VoterController::class, 'index'])
            ->name('voters.index');

        Route::get('/voters/create', [VoterController::class, 'create'])
            ->name('voters.create');

        Route::post('/voters', [VoterController::class, 'store'])
            ->name('voters.store');

        Route::get('/voters/{voter}/edit', [VoterController::class, 'edit'])
            ->name('voters.edit');

        Route::patch('/voters/{voter}', [VoterController::class, 'update'])
            ->name('voters.update');

        Route::put('/voters/{voter}', [VoterController::class, 'update']);

        Route::delete('/voters/{voter}', [VoterController::class, 'destroy'])
            ->name('voters.destroy');

        Route::post(
            '/voters/{voter}/reset-password',
            [VoterController::class, 'resetPassword']
        )->name('voters.reset-password');

        // election management routes

        Route::get(
            '/elections',
            [ElectionController::class, 'index']
        )->name('elections.index');

        Route::get(
            '/elections/create',
            [ElectionController::class, 'create']
        )->name('elections.create');

        Route::post(
            '/elections',
            [ElectionController::class, 'store']
        )->name('elections.store');

        Route::get(
            '/elections/{election}',
            [ElectionController::class, 'show']
        )->name('elections.show');

        Route::get('/elections/{election}/live-data', [ElectionController::class, 'liveData'])
            ->name('elections.live-data');

        Route::get(
            '/elections/{election}/edit',
            [ElectionController::class, 'edit']
        )->name('elections.edit');

        Route::patch(
            '/elections/{election}',
            [ElectionController::class, 'update']
        )->name('elections.update');

        Route::put(
            '/elections/{election}',
            [ElectionController::class, 'update']
        );

        Route::delete(
            '/elections/{election}',
            [ElectionController::class, 'destroy']
        )->name('elections.destroy');

        // organization management routes

        Route::get(
            '/organizations',
            [OrganizationController::class, 'index']
        )->name('organizations.index');

        Route::get(
            '/organizations/create',
            [OrganizationController::class, 'create']
        )->name('organizations.create');

        Route::post(
            '/organizations',
            [OrganizationController::class, 'store']
        )->name('organizations.store');

        Route::get(
            '/organizations/{organization}',
            [OrganizationController::class, 'show']
        )->name('organizations.show');

        Route::get(
            '/organizations/{organization}/edit',
            [OrganizationController::class, 'edit']
        )->name('organizations.edit');

        Route::patch(
            '/organizations/{organization}',
            [OrganizationController::class, 'update']
        )->name('organizations.update');

        Route::put(
            '/organizations/{organization}',
            [OrganizationController::class, 'update']
        );

        Route::delete(
            '/organizations/{organization}',
            [OrganizationController::class, 'destroy']
        )->name('organizations.destroy');

        // ============================================================
        // PARTYLIST MANAGEMENT ROUTES
        // ============================================================

        Route::resource(
            'partylists',
            PartylistController::class
        );

        // ============================================================
        // PARTYLIST CANDIDATE MANAGEMENT ROUTES
        // ============================================================

        Route::get(
            '/partylists/{partylist}/candidates',
            [CandidateController::class, 'index']
        )->name('partylists.candidates.index');

        Route::get(
            '/partylists/{partylist}/candidates/create',
            [CandidateController::class, 'create']
        )->name('partylists.candidates.create');

        Route::get(
            '/partylists/{partylist}/candidates/{candidate}/edit',
            [CandidateController::class, 'edit']
        )->name('partylists.candidates.edit');

        Route::post(
            '/partylists/{partylist}/candidates',
            [CandidateController::class, 'store']
        )->name('partylists.candidates.store');

        Route::put(
            '/partylists/{partylist}/candidates/{candidate}',
            [CandidateController::class, 'update']
        )->name('partylists.candidates.update');

        Route::delete(
            '/partylists/{partylist}/candidates/{candidate}',
            [CandidateController::class, 'destroy']
        )->name('partylists.candidates.destroy');

        Route::post(
            '/partylists/{partylist}/candidates/bulk',
            [CandidateController::class, 'bulkStore']
        )->name('partylists.candidates.bulk');

        // ============================================================
        // INDEPENDENT CANDIDATE MANAGEMENT ROUTES
        // ============================================================

        Route::get(
            '/independent-candidates',
            [CandidateController::class, 'independentIndex']
        )->name('independent-candidates.index');

        Route::get(
            '/independent-candidates/create',
            [CandidateController::class, 'independentCreate']
        )->name('independent-candidates.create');

        Route::get(
            '/independent-candidates/{candidate}/edit',
            [CandidateController::class, 'independentEdit']
        )->name('independent-candidates.edit');

        Route::post(
            '/independent-candidates',
            [CandidateController::class, 'independentStore']
        )->name('independent-candidates.store');

        Route::put(
            '/independent-candidates/{candidate}',
            [CandidateController::class, 'independentUpdate']
        )->name('independent-candidates.update');

        Route::delete(
            '/independent-candidates/{candidate}',
            [CandidateController::class, 'independentDestroy']
        )->name('independent-candidates.destroy');

    });

Route::middleware(['auth', 'voter'])
    ->prefix('voter')
    ->name('voter.')
    ->group(function () {

        // dashboard route

        Route::get(
            '/dashboard',
            [VoterDashboardController::class, 'index']
        )->name('dashboard');

        // elections

        Route::get(
            '/elections',
            [App\Http\Controllers\Voter\ElectionController::class, 'index']
        )->name('elections.index');

        Route::get(
            '/elections/{election}',
            [App\Http\Controllers\Voter\ElectionController::class, 'show']
        )->name('elections.show');

        // voting routes
        Route::get(
            '/elections/{election}/vote',
            [VotingController::class, 'create']
        )->name('vote.create');

        Route::post(
            '/elections/{election}/vote',
            [VotingController::class, 'store']
        )->name('vote.store');

        // vote history routes

        Route::get(
            '/vote-history',
            [VoteHistoryController::class, 'index']
        )->name('vote.history');

        Route::get(
            '/vote-history/{election}',
            [VoteHistoryController::class, 'election']
        )->name('vote.history.election');

        // profile routes
        Route::get(
            '/profile',
            [ProfileController::class, 'index']
        )->name('profile');

        Route::patch(
            '/profile',
            [ProfileController::class, 'update']
        )->name('profile.update');

        // password routes
        Route::put(
            '/password',
            [ProfileController::class, 'updatePassword']
        )->name('password.update');
    });
// settings routes

require __DIR__.'/settings.php';

// authentication routes

require __DIR__.'/auth.php';
