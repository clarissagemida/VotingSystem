<?php

namespace App\Support;

use App\Models\Election;
use App\Models\OrganizationPosition;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class ElectionResults
{
    public function forElection(Election $election): array
    {
        $candidates = $election->candidates()
            ->with(['organization:id,name', 'partylist:id,partylist_name,acronym,color'])
            ->orderBy('organization_id')
            ->orderBy('position_name')
            ->orderBy('id')
            ->get();

        $voteCounts = $election->votes()
            ->selectRaw('candidate_id, position_name, COUNT(*) as vote_count')
            ->groupBy('candidate_id', 'position_name')
            ->get()
            ->keyBy(fn ($vote) => $vote->candidate_id);

        $positionOrder = OrganizationPosition::query()
            ->select('organization_id', 'position_name', 'position_order')
            ->orderBy('position_order')
            ->get()
            ->mapWithKeys(fn (OrganizationPosition $position) => [
                $position->organization_id.':'.$position->position_name => (int) $position->position_order,
            ]);

        $groups = $candidates->groupBy(fn ($candidate) => $candidate->organization_id.':'.$candidate->position_name);
        $positions = $groups->map(function (Collection $group) use ($voteCounts, $positionOrder) {
            $total = $group->sum(fn ($candidate) => (int) ($voteCounts[$candidate->id]->vote_count ?? 0));
            $max = $group->max(fn ($candidate) => (int) ($voteCounts[$candidate->id]->vote_count ?? 0));
            $leaders = $group->filter(fn ($candidate) => $max > 0 && (int) ($voteCounts[$candidate->id]->vote_count ?? 0) === $max)->count();
            $first = $group->first();

            return [
                'organization_id' => $first->organization_id,
                'organization' => $first->organization?->name ?? 'Organization',
                'position' => $first->position_name,
                'position_order' => $positionOrder[$first->organization_id.':'.$first->position_name] ?? PHP_INT_MAX,
                'total_votes' => $total,
                'candidates' => $group->map(function ($candidate) use ($group, $voteCounts, $total, $max, $leaders) {
                    $votes = (int) ($voteCounts[$candidate->id]->vote_count ?? 0);
                    $labelIndex = $group->sortBy('id')->values()->search(fn ($ordered) => $ordered->id === $candidate->id);

                    return [
                        'id' => $candidate->id,
                        'name' => $candidate->candidate_name,
                        'label' => 'Candidate '.chr(65 + (int) $labelIndex),
                        'photo' => $candidate->photo ? Storage::disk('public')->url($candidate->photo) : null,
                        'type' => $candidate->candidate_type,
                        'partylist' => $candidate->partylist?->acronym ?? $candidate->partylist?->partylist_name,
                        'partylist_color' => $candidate->partylist?->color,
                        'votes' => $votes,
                        'percentage' => $total > 0 ? round($votes / $total * 100, 1) : 0,
                        'rank' => $votes > 0 ? 1 + $group->filter(fn ($other) => (int) ($voteCounts[$other->id]->vote_count ?? 0) > $votes)->count() : null,
                        'tied' => $max > 0 && $leaders > 1 && $votes === $max,
                        'leading' => $max > 0 && $votes === $max,
                    ];
                })->sortByDesc('votes')->values(),
            ];
        })->sortBy(fn ($position) => [$position['position_order'], $position['organization'], $position['position']])->values();

        $eligible = $election->eligibleVoters()->count();
        $participated = $election->votes()->distinct('voter_id')->count('voter_id');

        return [
            'election' => [
                'id' => $election->id,
                'title' => $election->title,
                'status' => $election->status,
                'start_at' => $election->start_at?->toIso8601String(),
                'end_at' => $election->end_at?->toIso8601String(),
            ],
            'eligible' => $eligible,
            'participated' => $participated,
            'turnout' => $eligible > 0 ? round($participated / $eligible * 100, 1) : 0,
            'positions' => $positions,
            'updated_at' => now()->toIso8601String(),
        ];
    }
}
