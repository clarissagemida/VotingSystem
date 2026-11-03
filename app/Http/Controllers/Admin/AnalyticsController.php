<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\Election;
use App\Models\ElectionVoter;
use App\Models\Organization;
use App\Models\OrganizationPosition;
use App\Models\Partylist;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    /**
     * Display election analytics.
     *
     * Query parameter:
     *
     * /admin/analytics
     * /admin/analytics?election_id=1
     */
    public function index(Request $request): Response
    {
        /*
        |--------------------------------------------------------------------------
        | ELECTION FILTER
        |--------------------------------------------------------------------------
        */

        $selectedElectionId = $request->integer('election_id');

        /*
        |--------------------------------------------------------------------------
        | AVAILABLE ELECTIONS
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        | Do not select "status" because status is an Eloquent accessor
        | in your Election model, not a database column.
        |
        */

        $elections = Election::query()
            ->orderByDesc('start_at')
            ->get([
                'id',
                'title',
                'description',
                'start_at',
                'end_at',
            ])
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
                    | Dynamic accessor from Election model
                    |--------------------------------------------------------------------------
                    */

                    'status' => $election->status,
                ];
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | SELECTED ELECTION
        |--------------------------------------------------------------------------
        */

        $selectedElection = null;

        if ($selectedElectionId) {
            $selectedElection = Election::query()
                ->find($selectedElectionId);

            /*
            |--------------------------------------------------------------------------
            | If an invalid election_id was supplied, treat it as All Elections.
            |--------------------------------------------------------------------------
            */

            if (! $selectedElection) {
                $selectedElectionId = null;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | BASE VOTE QUERY
        |--------------------------------------------------------------------------
        */

        $voteQuery = Vote::query();

        if ($selectedElectionId) {
            $voteQuery->where(
                'election_id',
                $selectedElectionId
            );
        }

        /*
        |--------------------------------------------------------------------------
        | OVERVIEW
        |--------------------------------------------------------------------------
        */

        /*
        |--------------------------------------------------------------------------
        | Total registered voters
        |--------------------------------------------------------------------------
        */

        $totalRegisteredVoters = User::query()
            ->where('role', 'voter')
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Eligible voters
        |--------------------------------------------------------------------------
        |
        | For a selected election, use election_voters.
        |
        | For All Elections, we don't add eligibility counts together because
        | the same voter may be eligible for multiple elections.
        |
        */

        if ($selectedElectionId) {
            $eligibleVoters = ElectionVoter::query()
                ->where(
                    'election_id',
                    $selectedElectionId
                )
                ->count();
        } else {
            $eligibleVoters = $totalRegisteredVoters;
        }

        /*
        |--------------------------------------------------------------------------
        | Voters who participated
        |--------------------------------------------------------------------------
        */

        $votersParticipated = (clone $voteQuery)
            ->whereNotNull('voter_id')
            ->distinct('voter_id')
            ->count('voter_id');

        /*
        |--------------------------------------------------------------------------
        | Vote selections
        |--------------------------------------------------------------------------
        |
        | COUNT(*) represents individual selections.
        |
        | Example:
        |
        | One voter selects 5 positions.
        | That can create 5 vote records.
        |
        | Therefore:
        |
        | voters_participated != vote_selections
        |
        */

        $totalVoteSelections = (clone $voteQuery)
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Did not vote
        |--------------------------------------------------------------------------
        */

        $votersNotVoted = max(
            0,
            $eligibleVoters - $votersParticipated
        );

        /*
        |--------------------------------------------------------------------------
        | Turnout
        |--------------------------------------------------------------------------
        */

        $turnoutPercent = $eligibleVoters > 0
            ? round(
                (
                    $votersParticipated /
                    $eligibleVoters
                ) * 100,
                1
            )
            : 0;

        /*
        |--------------------------------------------------------------------------
        | Election counts
        |--------------------------------------------------------------------------
        */

        $totalElections = Election::count();

        $ongoingElections = Election::query()
            ->where(
                'start_at',
                '<=',
                now()
            )
            ->where(
                'end_at',
                '>=',
                now()
            )
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Partylist / Organization / Candidate overview
        |--------------------------------------------------------------------------
        */

        $totalPartylists = Partylist::count();

        $totalOrganizations = Organization::count();

        if ($selectedElectionId) {

            $totalCandidates = Candidate::query()
                ->where(
                    'election_id',
                    $selectedElectionId
                )
                ->count();

            $partylistCandidates = Candidate::query()
                ->where(
                    'election_id',
                    $selectedElectionId
                )
                ->where(
                    'candidate_type',
                    'partylist'
                )
                ->count();

            $independentCandidates = Candidate::query()
                ->where(
                    'election_id',
                    $selectedElectionId
                )
                ->where(
                    'candidate_type',
                    'independent'
                )
                ->count();

        } else {

            $totalCandidates = Candidate::count();

            $partylistCandidates = Candidate::query()
                ->where(
                    'candidate_type',
                    'partylist'
                )
                ->count();

            $independentCandidates = Candidate::query()
                ->where(
                    'candidate_type',
                    'independent'
                )
                ->count();
        }

        /*
        |--------------------------------------------------------------------------
        | ELECTION TURNOUT
        |--------------------------------------------------------------------------
        */

        $electionTurnout = Election::query()
            ->orderByDesc('start_at')
            ->get([
                'id',
                'title',
                'start_at',
                'end_at',
            ])
            ->map(function (Election $election) {

                /*
                |--------------------------------------------------------------------------
                | Actual eligible voters for this election
                |--------------------------------------------------------------------------
                */

                $eligible = ElectionVoter::query()
                    ->where(
                        'election_id',
                        $election->id
                    )
                    ->count();

                /*
                |--------------------------------------------------------------------------
                | Unique voters who participated
                |--------------------------------------------------------------------------
                */

                $voted = Vote::query()
                    ->where(
                        'election_id',
                        $election->id
                    )
                    ->whereNotNull('voter_id')
                    ->distinct('voter_id')
                    ->count('voter_id');

                /*
                |--------------------------------------------------------------------------
                | Turnout
                |--------------------------------------------------------------------------
                */

                $percent = $eligible > 0
                    ? round(
                        (
                            $voted /
                            $eligible
                        ) * 100,
                        1
                    )
                    : 0;

                return [
                    'id' => $election->id,

                    'title' => $election->title,

                    /*
                    |--------------------------------------------------------------------------
                    | Dynamic status accessor
                    |--------------------------------------------------------------------------
                    */

                    'status' => $election->status,

                    'start_at' => $election->start_at
                        ?->format('Y-m-d H:i:s'),

                    'end_at' => $election->end_at
                        ?->format('Y-m-d H:i:s'),

                    'eligible_voters' => $eligible,

                    'voted' => $voted,

                    'not_voted' => max(
                        0,
                        $eligible - $voted
                    ),

                    'percent' => $percent,
                ];
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | CANDIDATE VOTE COUNTS
        |--------------------------------------------------------------------------
        */

        $candidateVoteQuery = Vote::query()
            ->select([
                'candidate_id',
                'position_name',
            ])
            ->selectRaw('COUNT(*) as votes')
            ->whereNotNull('candidate_id');

        if ($selectedElectionId) {
            $candidateVoteQuery->where(
                'election_id',
                $selectedElectionId
            );
        }

        $candidateVoteCounts = $candidateVoteQuery
            ->groupBy(
                'candidate_id',
                'position_name'
            )
            ->get();

        /*
        |--------------------------------------------------------------------------
        | VOTE COUNT PER CANDIDATE
        |--------------------------------------------------------------------------
        |
        | candidate_id => votes so candidates without votes default to 0.
        |
        */

        $voteCountsByCandidate =
            $candidateVoteCounts->mapWithKeys(
                function ($row) {
                    return [
                        $row->candidate_id => (int) $row->votes,
                    ];
                }
            );

        /*
        |--------------------------------------------------------------------------
        | POSITION TOTALS FOR VOTE SHARE
        |--------------------------------------------------------------------------
        */

        $positionTotals = $candidateVoteCounts
            ->groupBy('position_name')
            ->map(function ($rows) {
                return (int) $rows->sum(
                    fn ($row) => (int) $row->votes
                );
            });

        /*
        |--------------------------------------------------------------------------
        | ALL CANDIDATES
        |--------------------------------------------------------------------------
        |
        | Load every candidate (filtered to the selected election if any),
        | including those who have not received a single vote yet.
        |
        */

        $candidateQuery = Candidate::query()
            ->with([
                'election:id,title',
                'partylist:id,partylist_name,acronym,color',
                'organization:id,name',
            ]);

        if ($selectedElectionId) {
            $candidateQuery->where(
                'election_id',
                $selectedElectionId
            );
        }

        $candidatesCollection = $candidateQuery
            ->get();

        $positionMap = $this->positionOrderMap();

        /*
        |--------------------------------------------------------------------------
        | CANDIDATE LEADERBOARD
        |--------------------------------------------------------------------------
        |
        | Vote share is calculated against votes for the same position.
        |
        */

        $leaderboard = $candidatesCollection
            ->map(function ($candidate) use (
                $voteCountsByCandidate,
                $positionTotals
            ) {

                $votes = (int) (
                    $voteCountsByCandidate[
                        $candidate->id
                    ] ?? 0
                );

                $position =
                    $candidate->position_name;

                $positionTotal =
                    (int) (
                        $positionTotals[$position]
                        ?? 0
                    );

                $share = $positionTotal > 0
                    ? round(
                        (
                            $votes /
                            $positionTotal
                        ) * 100,
                        1
                    )
                    : 0;

                return [
                    'id' => $candidate->id,

                    'name' => $candidate->candidate_name,

                    'position' => $position,

                    'type' => $candidate->candidate_type ===
                        'independent'
                            ? 'independent'
                            : 'partylist',

                    'partylist' => $candidate->partylist
                            ? [
                                'name' => $candidate->partylist->partylist_name,
                                'acronym' => $candidate->partylist->acronym,
                                'color' => $candidate->partylist->color,
                            ]
                            : null,

                    'election' => $candidate->election?->title,

                    'election_id' => $candidate->election_id,

                    'votes' => $votes,

                    'share' => $share,
                ];
            })
            ->filter()
            ->sortByDesc('votes')
            ->values();

        /*
        |--------------------------------------------------------------------------
        | VOTES PER CANDIDATE BY POSITION
        |--------------------------------------------------------------------------
        |
        | Every candidate (with or without votes) ranked inside their own
        | position with vote counts and vote share.
        |
        */

        $votesByPosition = $candidatesCollection
            ->groupBy(function ($candidate) {
                return $candidate->position_name
                    ?: 'Unknown';
            })
            ->mapWithKeys(function ($candidates, $position) use (
                $voteCountsByCandidate,
                $positionTotals
            ) {

                $candidates = $candidates
                    ->sortByDesc(function ($candidate) use (
                        $voteCountsByCandidate
                    ) {
                        return (int) (
                            $voteCountsByCandidate[
                                $candidate->id
                            ] ?? 0
                        );
                    })
                    ->map(function ($candidate) use (
                        $voteCountsByCandidate,
                        $positionTotals
                    ) {

                        $votes = (int) (
                            $voteCountsByCandidate[
                                $candidate->id
                            ] ?? 0
                        );

                        $positionTotal =
                            (int) (
                                $positionTotals[
                                    $candidate->position_name
                                ] ?? 0
                            );

                        $share =
                            $positionTotal > 0
                                ? round(
                                    (
                                        $votes /
                                        $positionTotal
                                    ) * 100,
                                    1
                                )
                                : 0;

                        return [
                            'id' => $candidate->id,

                            'name' => $candidate->candidate_name,

                            'organization_id' => $candidate->organization_id,

                            'organization_name' => $candidate->organization?->name,

                            'type' => $candidate->candidate_type ===
                                'independent'
                                    ? 'independent'
                                    : 'partylist',

                            'partylist' => $candidate->partylist
                                    ? [
                                        'name' => $candidate->partylist->partylist_name,
                                        'acronym' => $candidate->partylist->acronym,
                                        'color' => $candidate->partylist->color,
                                    ]
                                    : null,

                            'election' => $candidate->election?->title,

                            'votes' => $votes,

                            'share' => $share,
                        ];
                    })
                    ->values();

                return [
                    $position => [
                        'position' => $position,

                        'total_votes' => (int) $candidates->sum('votes'),

                        'candidates' => $candidates,
                    ],
                ];
            })
            ->sortBy(
                fn ($group) => $positionMap[$group['position']]
                    ?? PHP_INT_MAX
            )
            ->values();

        /*
        |--------------------------------------------------------------------------
        | CANDIDATES BY ORGANIZATION
        |--------------------------------------------------------------------------
        */

        $organizationQuery = Organization::query()
            ->withCount([
                'candidates' => function ($query) use (
                    $selectedElectionId
                ) {
                    if ($selectedElectionId) {
                        $query->where(
                            'election_id',
                            $selectedElectionId
                        );
                    }
                },
            ])
            ->orderByDesc('candidates_count')
            ->limit(10);

        $candidatesByOrganization =
            $organizationQuery
                ->get()
                ->map(function (
                    Organization $organization
                ) {
                    return [
                        'id' => $organization->id,

                        'name' => $organization->name,

                        'candidates' => (int)
                            $organization->candidates_count,
                    ];
                })
                ->values();

        $maxOrganizationCandidates =
            $candidatesByOrganization
                ->max('candidates') ?: 0;

        /*
        |--------------------------------------------------------------------------
        | DAILY VOTING ACTIVITY
        |--------------------------------------------------------------------------
        |
        | Last 14 days.
        |
        */

        $since = Carbon::now()
            ->subDays(13)
            ->startOfDay();

        $activityQuery = Vote::query()
            ->where(
                'created_at',
                '>=',
                $since->toDateTimeString()
            );

        if ($selectedElectionId) {
            $activityQuery->where(
                'election_id',
                $selectedElectionId
            );
        }

        $activityRows = $activityQuery
            ->selectRaw(
                'DATE(created_at) as day, COUNT(*) as votes'
            )
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->keyBy('day');

        $dailyActivity = collect(
            range(0, 13)
        )
            ->map(function (
                int $offset
            ) use (
                $since,
                $activityRows
            ) {

                $date =
                    $since->copy()
                        ->addDays($offset);

                $key =
                    $date->toDateString();

                return [
                    'label' => $date->format('M j'),

                    'full' => $key,

                    'votes' => (int) (
                        $activityRows[$key]
                            ->votes
                        ?? 0
                    ),

                    'is_today' => $date->isToday(),
                ];
            })
            ->values();

        $maxDailyVotes =
            $dailyActivity->max('votes') ?: 0;

        $totalDailyVotes =
            (int) $dailyActivity->sum('votes');

        /*
        |--------------------------------------------------------------------------
        | HOURLY ACTIVITY
        |--------------------------------------------------------------------------
        */

        $hourlyQuery = Vote::query()
            ->where(
                'created_at',
                '>=',
                $since->toDateTimeString()
            );

        if ($selectedElectionId) {
            $hourlyQuery->where(
                'election_id',
                $selectedElectionId
            );
        }

        /*
        |--------------------------------------------------------------------------
        | PostgreSQL-compatible hour extraction
        |--------------------------------------------------------------------------
        */

        $hourlyRows = $hourlyQuery
            ->selectRaw(
                'EXTRACT(HOUR FROM created_at)::integer as hour, COUNT(*) as votes'
            )
            ->groupByRaw(
                'EXTRACT(HOUR FROM created_at)'
            )
            ->orderBy('hour')
            ->get()
            ->keyBy('hour');

        $hourlyActivity = collect(
            range(0, 23)
        )
            ->map(function (int $hour) use (
                $hourlyRows
            ) {

                $row =
                    $hourlyRows[$hour]
                    ?? null;

                $date =
                    Carbon::createFromTime(
                        $hour,
                        0,
                        0
                    );

                return [
                    'hour' => $hour,

                    'label' => $date->format('g A'),

                    'votes' => (int) (
                        $row->votes
                        ?? 0
                    ),
                ];
            })
            ->values();

        $maxHourlyVotes =
            $hourlyActivity->max('votes') ?: 0;

        /*
        |--------------------------------------------------------------------------
        | PEAK VOTING HOUR
        |--------------------------------------------------------------------------
        */

        $peakHour =
            $maxHourlyVotes > 0
                ? $hourlyActivity
                    ->sortByDesc('votes')
                    ->first()
                : null;

        /*
        |--------------------------------------------------------------------------
        | DATA INTEGRITY
        |--------------------------------------------------------------------------
        */

        $integrity = $this->calculateDataIntegrity(
            $selectedElectionId
        );

        /*
        |--------------------------------------------------------------------------
        | ELIGIBILITY STATUS
        |--------------------------------------------------------------------------
        */

        $eligibilityConfigured = true;

        if ($selectedElectionId) {
            $eligibilityConfigured =
                ElectionVoter::query()
                    ->where(
                        'election_id',
                        $selectedElectionId
                    )
                    ->exists();
        }

        /*
        |--------------------------------------------------------------------------
        | FINAL RESPONSE
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'AdminSide/Analytics',
            [
                /*
                |--------------------------------------------------------------------------
                | Election filter
                |--------------------------------------------------------------------------
                */

                'elections' => $elections,

                'selectedElectionId' => $selectedElectionId,

                'selectedElection' => $selectedElection
                        ? [
                            'id' => $selectedElection->id,

                            'title' => $selectedElection->title,

                            'status' => $selectedElection->status,

                            'start_at' => $selectedElection
                                ->start_at
                                ?->format(
                                    'Y-m-d H:i:s'
                                ),

                            'end_at' => $selectedElection
                                ->end_at
                                ?->format(
                                    'Y-m-d H:i:s'
                                ),
                        ]
                        : null,

                /*
                |--------------------------------------------------------------------------
                | Overview
                |--------------------------------------------------------------------------
                */

                'overview' => [
                    'total_voters' => $totalRegisteredVoters,

                    'eligible_voters' => $eligibleVoters,

                    'total_elections' => $totalElections,

                    'total_partylists' => $totalPartylists,

                    'total_organizations' => $totalOrganizations,

                    'total_candidates' => $totalCandidates,

                    'partylist_candidates' => $partylistCandidates,

                    'independent_candidates' => $independentCandidates,

                    /*
                    |--------------------------------------------------------------------------
                    | Vote selections
                    |--------------------------------------------------------------------------
                    */

                    'total_votes_cast' => $totalVoteSelections,

                    /*
                    |--------------------------------------------------------------------------
                    | Unique voters
                    |--------------------------------------------------------------------------
                    */

                    'total_votes_unique' => $votersParticipated,

                    /*
                    |--------------------------------------------------------------------------
                    | Did not participate
                    |--------------------------------------------------------------------------
                    */

                    'total_votes_other' => $votersNotVoted,

                    /*
                    |--------------------------------------------------------------------------
                    | Turnout
                    |--------------------------------------------------------------------------
                    */

                    'turnout_percent' => $turnoutPercent,

                    'ongoing_elections' => $ongoingElections,

                    'eligibility_configured' => $eligibilityConfigured,
                ],

                /*
                |--------------------------------------------------------------------------
                | Election comparison
                |--------------------------------------------------------------------------
                */

                'electionTurnout' => $electionTurnout,

                /*
                |--------------------------------------------------------------------------
                | Candidate analytics
                |--------------------------------------------------------------------------
                */

                'leaderboard' => $leaderboard,

                /*
                |--------------------------------------------------------------------------
                | Position analytics
                |--------------------------------------------------------------------------
                */

                'votesByPosition' => $votesByPosition,

                /*
                |--------------------------------------------------------------------------
                | Organization analytics
                |--------------------------------------------------------------------------
                */

                'candidatesByOrganization' => $candidatesByOrganization,

                'maxOrganizationCandidates' => $maxOrganizationCandidates,

                /*
                |--------------------------------------------------------------------------
                | Daily activity
                |--------------------------------------------------------------------------
                */

                'dailyActivity' => $dailyActivity,

                'maxDailyVotes' => $maxDailyVotes,

                'totalDailyVotes' => $totalDailyVotes,

                /*
                |--------------------------------------------------------------------------
                | Hourly activity
                |--------------------------------------------------------------------------
                */

                'hourlyActivity' => $hourlyActivity,

                'maxHourlyVotes' => $maxHourlyVotes,

                'peakHour' => $peakHour,

                /*
                |--------------------------------------------------------------------------
                | Data integrity
                |--------------------------------------------------------------------------
                */

                'dataIntegrity' => $integrity,

                'lastUpdated' => now()->format('M d, Y g:i A'),
            ]
        );
    }

    /**
     * Build a position_name => position_order map so positions are
     * displayed from the highest position (e.g. President) down to the
     * lowest. When several organizations define the same position with
     * different orders, the smallest (highest-ranked) order wins.
     */
    private function positionOrderMap(): array
    {
        return OrganizationPosition::query()
            ->get()
            ->reduce(function (array $carry, OrganizationPosition $position) {
                $name = $position->position_name;
                $order = $position->position_order ?? PHP_INT_MAX;

                if (! isset($carry[$name]) || $order < $carry[$name]) {
                    $carry[$name] = $order;
                }

                return $carry;
            }, []);
    }

    /**
     * Calculate data integrity information.
     *
     * IMPORTANT:
     *
     * These checks inspect vote records but do not expose
     * the voter's candidate choice in audit logs.
     */
    private function calculateDataIntegrity(
        ?int $electionId
    ): array {

        /*
        |--------------------------------------------------------------------------
        | Base query
        |--------------------------------------------------------------------------
        */

        $voteQuery = Vote::query();

        if ($electionId) {
            $voteQuery->where(
                'election_id',
                $electionId
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Total vote records
        |--------------------------------------------------------------------------
        */

        $totalVotes =
            (clone $voteQuery)->count();

        /*
        |--------------------------------------------------------------------------
        | Missing election references
        |--------------------------------------------------------------------------
        */

        $missingElectionVotes =
            (clone $voteQuery)
                ->whereNull('election_id')
                ->count();

        /*
        |--------------------------------------------------------------------------
        | Missing voter references
        |--------------------------------------------------------------------------
        */

        $missingVoterVotes =
            (clone $voteQuery)
                ->whereNull('voter_id')
                ->count();

        /*
        |--------------------------------------------------------------------------
        | Missing candidate references
        |--------------------------------------------------------------------------
        */

        $missingCandidateVotes =
            (clone $voteQuery)
                ->whereNull('candidate_id')
                ->count();

        /*
        |--------------------------------------------------------------------------
        | Missing position
        |--------------------------------------------------------------------------
        */

        $missingPositionVotes =
            (clone $voteQuery)
                ->whereNull('position_name')
                ->count();

        /*
        |--------------------------------------------------------------------------
        | Votes referencing deleted/non-existing candidates
        |--------------------------------------------------------------------------
        */

        $orphanCandidateVotes = (clone $voteQuery)
            ->whereNotNull('candidate_id')
            ->whereDoesntHave('candidate')
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Votes referencing deleted/non-existing elections
        |--------------------------------------------------------------------------
        */

        $orphanElectionVotes = (clone $voteQuery)
            ->whereNotNull('election_id')
            ->whereDoesntHave('election')
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Votes referencing deleted/non-existing voters
        |--------------------------------------------------------------------------
        */

        $orphanVoterVotes = (clone $voteQuery)
            ->whereNotNull('voter_id')
            ->whereDoesntHave('voter')
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Candidate/election mismatch
        |--------------------------------------------------------------------------
        |
        | Candidate must belong to the same election as the vote.
        |
        */

        $candidateElectionMismatch = (clone $voteQuery)
            ->whereNotNull('candidate_id')
            ->whereNotNull('election_id')
            ->whereHas(
                'candidate',
                function ($query) {
                    $query->whereColumn(
                        'candidates.election_id',
                        'votes.election_id'
                    );
                },
                '<',
                1
            )
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Election eligibility check
        |--------------------------------------------------------------------------
        |
        | Check whether voters associated with a selected election
        | are actually eligible.
        |
        */

        $ineligibleVoterVotes = 0;

        if ($electionId) {

            $ineligibleVoterVotes =
                Vote::query()
                    ->where(
                        'election_id',
                        $electionId
                    )
                    ->whereNotNull('voter_id')
                    ->whereNotIn(
                        'voter_id',
                        ElectionVoter::query()
                            ->where(
                                'election_id',
                                $electionId
                            )
                            ->select('voter_id')
                    )
                    ->count();
        }

        /*
        |--------------------------------------------------------------------------
        | Total problems
        |--------------------------------------------------------------------------
        */

        $totalProblems =
            $missingElectionVotes +
            $missingVoterVotes +
            $missingCandidateVotes +
            $missingPositionVotes +
            $orphanCandidateVotes +
            $orphanElectionVotes +
            $orphanVoterVotes +
            $candidateElectionMismatch +
            $ineligibleVoterVotes;

        /*
        |--------------------------------------------------------------------------
        | Overall status
        |--------------------------------------------------------------------------
        */

        $status =
            $totalProblems === 0
                ? 'healthy'
                : 'warning';

        return [
            'status' => $status,

            'healthy' => $totalProblems === 0,

            'total_votes_checked' => $totalVotes,

            'total_problems' => $totalProblems,

            'checks' => [
                [
                    'key' => 'missing_election',

                    'label' => 'Votes with missing election',

                    'count' => $missingElectionVotes,

                    'healthy' => $missingElectionVotes === 0,
                ],

                [
                    'key' => 'missing_voter',

                    'label' => 'Votes with missing voter',

                    'count' => $missingVoterVotes,

                    'healthy' => $missingVoterVotes === 0,
                ],

                [
                    'key' => 'missing_candidate',

                    'label' => 'Votes with missing candidate',

                    'count' => $missingCandidateVotes,

                    'healthy' => $missingCandidateVotes === 0,
                ],

                [
                    'key' => 'missing_position',

                    'label' => 'Votes with missing position',

                    'count' => $missingPositionVotes,

                    'healthy' => $missingPositionVotes === 0,
                ],

                [
                    'key' => 'orphan_candidate',

                    'label' => 'Votes referencing invalid candidates',

                    'count' => $orphanCandidateVotes,

                    'healthy' => $orphanCandidateVotes === 0,
                ],

                [
                    'key' => 'orphan_election',

                    'label' => 'Votes referencing invalid elections',

                    'count' => $orphanElectionVotes,

                    'healthy' => $orphanElectionVotes === 0,
                ],

                [
                    'key' => 'orphan_voter',

                    'label' => 'Votes referencing invalid voters',

                    'count' => $orphanVoterVotes,

                    'healthy' => $orphanVoterVotes === 0,
                ],

                [
                    'key' => 'candidate_election_mismatch',

                    'label' => 'Candidate/election mismatches',

                    'count' => $candidateElectionMismatch,

                    'healthy' => $candidateElectionMismatch === 0,
                ],

                [
                    'key' => 'ineligible_voter',

                    'label' => 'Votes from ineligible voters',

                    'count' => $ineligibleVoterVotes,

                    'healthy' => $ineligibleVoterVotes === 0,
                ],
            ],
        ];
    }
}
