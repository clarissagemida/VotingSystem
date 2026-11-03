<?php

namespace App\Http\Controllers;

use App\Models\Election;
use App\Support\ElectionResults;
use Illuminate\Http\JsonResponse;

class PublicLiveResultsController extends Controller
{
    public function show(Election $election, ElectionResults $results): JsonResponse
    {
        abort_unless($election->status === 'Ongoing' || $election->status === 'Completed', 404);

        $data = $results->forElection($election);
        $visible = in_array($election->status, ['Ongoing', 'Completed'], true);

        return response()->json([
            'election' => $data['election'],
            'visible' => $visible,
            'updated_at' => $data['updated_at'],
            'positions' => $data['positions']->map(fn ($position) => [
                'organization' => $position['organization'],
                'position' => $position['position'],
                'candidates' => $visible ? $position['candidates']->sortBy('id')->values()->map(fn ($candidate, $index) => [
                    'label' => 'Candidate '.chr(65 + $index),
                    'votes' => $candidate['votes'],
                    'percentage' => $candidate['percentage'],
                    'progress' => $data['eligible'] > 0
                        ? min(100, round($candidate['votes'] / $data['eligible'] * 100, 1))
                        : 0,
                    'rank' => $candidate['rank'],
                    'tied' => $candidate['tied'],
                ]) : [],
            ]),
        ]);
    }
}
