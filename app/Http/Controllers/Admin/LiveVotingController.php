<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Election;
use App\Support\ElectionResults;
use Inertia\Inertia;
use Inertia\Response;

class LiveVotingController extends Controller
{
    public function index(ElectionResults $results): Response
    {
        $elections = Election::query()->orderByDesc('start_at')->get(['id', 'title', 'start_at', 'end_at']);
        $selected = $elections->first(fn (Election $election) => $election->status === 'Ongoing') ?? $elections->first();

        return Inertia::render('AdminSide/LiveVoting/Index', [
            'elections' => $elections->map(fn (Election $election) => [
                'id' => $election->id,
                'title' => $election->title,
                'status' => $election->status,
            ])->values(),
            'initialData' => $selected ? $results->forElection($selected) : null,
        ]);
    }
}
