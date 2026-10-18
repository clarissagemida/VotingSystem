import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Info, Shield, Vote } from 'lucide-react';
import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';

import AlreadyVotedGuard from '@/components/voter/AlreadyVotedGuard';
import BallotPositionSection from '@/components/voter/BallotPositionSection';
import BallotReviewModal from '@/components/voter/BallotReviewModal';
import CandidatePreviewModal from '@/components/voter/CandidatePreviewModal';
import CountdownTimer from '@/components/voter/CountdownTimer';
import StraightPartySection, { buildPartylistSlates, type PartylistSlate } from '@/components/voter/StraightPartySection';
import type { Candidate, ElectionSummary } from '@/components/voter/candidate-types';
import VoterLayout from '@/layouts/VoterLayout';

interface Props {
    election: ElectionSummary;
    candidates: Candidate[];
    positions: string[];
    votedPositions: string[];
}

export default function VotingIndex({ election, candidates, positions, votedPositions = [] }: Props) {
    const [selections, setSelections] = useState<Record<string, number | null>>(() => {
        const init: Record<string, number | null> = {};
        positions.forEach((p) => {
            init[p] = null;
        });
        return init;
    });

    const [submitting, setSubmitting] = useState(false);
    const [previewCandidate, setPreviewCandidate] = useState<Candidate | null>(null);
    const [showReview, setShowReview] = useState(false);
    const [editingPosition, setEditingPosition] = useState<string | null>(null);
    const [straightPartyId, setStraightPartyId] = useState<number | null>(null);

    const hasAlreadyVoted = election.has_voted || (positions.length > 0 && positions.every((p) => votedPositions.includes(p)));

    const selectedCount = Object.values(selections).filter((v): v is number => v !== null).length;
    const totalPositions = positions.length;

    const partylistSlates = useMemo<PartylistSlate[]>(() => buildPartylistSlates(candidates, positions), [candidates, positions]);

    const handleStraightParty = (pl: PartylistSlate) => {
        setSelections((prev) => {
            const next = { ...prev };
            positions.forEach((pos) => {
                if (pl.slots[pos] !== undefined) {
                    next[pos] = pl.slots[pos];
                }
            });
            return next;
        });

        setStraightPartyId(pl.id);
    };

    const handleSelect = (position: string, candidateId: number) => {
        setSelections((prev) => ({
            ...prev,
            [position]: prev[position] === candidateId ? null : candidateId,
        }));
    };

    const handleClearPosition = (position: string) => {
        setSelections((prev) => ({
            ...prev,
            [position]: null,
        }));
    };

    const handleSubmit = () => {
        if (selectedCount === 0) {
            Swal.fire({
                title: 'No Candidates Selected',
                text: 'Please select at least one candidate before submitting your ballot.',
                icon: 'warning',
                confirmButtonColor: '#2D6A4F',
            });
            return;
        }

        setEditingPosition(null);
        setShowReview(true);
    };

    const handleConfirmSubmit = () => {
        const votes = Object.values(selections).filter((v): v is number => v !== null);
        const unselectedPositions = positions.filter((p) => selections[p] === null);

        let warningHtml = `<p class="text-sm text-gray-600 mb-2">You are submitting votes for <strong>${votes.length}</strong> of <strong>${totalPositions}</strong> position(s).</p>`;
        if (unselectedPositions.length > 0) {
            warningHtml += `<div class="mt-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-left">
                <strong>Note:</strong> You left <strong>${unselectedPositions.length}</strong> position(s) blank (${unselectedPositions.join(', ')}). You cannot vote for them later.
            </div>`;
        }
        warningHtml += `<p class="mt-3 text-xs font-semibold text-gray-500">This action is final and cannot be undone.</p>`;

        Swal.fire({
            title: 'Confirm Your Ballot Submission',
            html: warningHtml,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Submit My Ballot',
            cancelButtonText: 'Go Back',
            confirmButtonColor: '#2D6A4F',
            cancelButtonColor: '#6b7280',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                setSubmitting(true);
                setShowReview(false);

                router.post(
                    `/voter/elections/${election.id}/vote`,
                    { votes },
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            Swal.fire({
                                title: 'Vote Successfully Cast!',
                                text: 'Your ballot has been officially recorded. Thank you for voting!',
                                icon: 'success',
                                confirmButtonColor: '#2D6A4F',
                            });
                        },
                        onError: (errors) => {
                            setSubmitting(false);
                            const errorMsg = errors.votes || errors.message || Object.values(errors)[0] || 'Failed to submit vote. Please try again.';

                            Swal.fire({
                                title: 'Submission Error',
                                text: typeof errorMsg === 'string' ? errorMsg : 'Failed to submit vote. Please try again.',
                                icon: 'error',
                                confirmButtonColor: '#2D6A4F',
                            });
                        },
                    },
                );
            }
        });
    };

    if (hasAlreadyVoted) {
        return <AlreadyVotedGuard election={election} />;
    }

    return (
        <VoterLayout>
            <Head title={`Cast Vote - ${election.title}`} />

            <div className="space-y-8 pb-20">
                <div className="flex items-center justify-between">
                    <Link
                        href={`/voter/elections/${election.id}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#2D6A4F]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Election Details
                    </Link>

                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                        <span className="inline-block h-2 w-2 animate-ping rounded-full bg-green-500" />
                        Official Live Ballot
                    </div>
                </div>

                {/* Ballot Hero with countdown */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#143728] via-[#1B4332] to-[#2D6A4F] p-6 text-white shadow-md sm:p-8">
                    <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/[0.05] blur-2xl" />
                    <div className="pointer-events-none absolute right-40 -bottom-20 h-52 w-52 rounded-full bg-emerald-400/[0.08] blur-xl" />

                    <div className="relative z-10 space-y-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 shadow-inner backdrop-blur-md">
                                    <Vote className="h-7 w-7 text-emerald-300" />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{election.title}</h1>
                                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/20 px-3 py-0.5 text-xs font-bold text-emerald-200">
                                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                                            Ongoing
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-green-100/90">
                                        Select your chosen candidate for each position below. Once submitted, your vote cannot be changed.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {election.end_at && (
                            <CountdownTimer
                                targetDate={election.end_at}
                                label="Voting Ends In"
                                countUpAfterExpiry
                                countUpLabel="Voting Closed"
                                variant="banner"
                                size="lg"
                            />
                        )}
                    </div>
                </div>

                {/* Progress summary bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#2D6A4F]">
                            <Info className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Ballot Progress</p>
                            <p className="text-sm font-bold text-gray-900">
                                {selectedCount} of {totalPositions} position{totalPositions !== 1 ? 's' : ''} selected
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-36 overflow-hidden rounded-full bg-gray-100 sm:w-48">
                            <div
                                className="h-full rounded-full bg-[#2D6A4F] transition-all duration-300"
                                style={{ width: `${totalPositions ? (selectedCount / totalPositions) * 100 : 0}%` }}
                            />
                        </div>
                        <span className="text-xs font-extrabold text-gray-700">
                            {Math.round(totalPositions ? (selectedCount / totalPositions) * 100 : 0)}%
                        </span>
                    </div>
                </div>

                <StraightPartySection
                    slates={partylistSlates}
                    totalPositions={totalPositions}
                    straightPartyId={straightPartyId}
                    onSelect={handleStraightParty}
                    onClear={() => setStraightPartyId(null)}
                />

                {/* Position Ballot Sections */}
                <div className="space-y-8">
                    {positions.map((position, idx) => (
                        <BallotPositionSection
                            key={position}
                            position={position}
                            index={idx}
                            candidates={candidates.filter((c) => c.position_name === position)}
                            selectedId={selections[position]}
                            onSelect={handleSelect}
                            onClear={handleClearPosition}
                            onPreview={setPreviewCandidate}
                        />
                    ))}
                </div>

                {/* Final Submission Card */}
                <div className="rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-white via-emerald-50/30 to-green-50/50 p-6 shadow-lg sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-[#2D6A4F]" />
                                <h3 className="text-lg font-bold text-gray-900">Ready to Cast Your Ballot?</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                                You have selected <strong className="text-gray-900">{selectedCount}</strong> candidate(s) across{' '}
                                <strong className="text-gray-900">{totalPositions}</strong> position(s). Once you submit, your ballot is permanently
                                locked and you cannot vote again.
                            </p>
                        </div>

                        <div className="flex shrink-0 flex-col items-center gap-3 sm:flex-row">
                            <button
                                type="button"
                                disabled={submitting || selectedCount === 0}
                                onClick={handleSubmit}
                                className="inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#2D6A4F] px-8 py-4 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-[#1B4332] hover:shadow-lg focus:ring-4 focus:ring-[#2D6A4F]/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >
                                <Vote className="h-5 w-5" />
                                {submitting ? 'Submitting Official Ballot...' : 'Submit Official Ballot'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showReview && (
                <BallotReviewModal
                    positions={positions}
                    candidates={candidates}
                    selections={selections}
                    selectedCount={selectedCount}
                    editingPosition={editingPosition}
                    submitting={submitting}
                    onEdit={setEditingPosition}
                    onDoneEditing={() => setEditingPosition(null)}
                    onSelect={handleSelect}
                    onClear={handleClearPosition}
                    onClose={() => setShowReview(false)}
                    onConfirm={handleConfirmSubmit}
                />
            )}

            {previewCandidate && (
                <CandidatePreviewModal
                    candidate={previewCandidate}
                    isSelected={selections[previewCandidate.position_name] === previewCandidate.id}
                    onSelect={(c) => handleSelect(c.position_name, c.id)}
                    onClose={() => setPreviewCandidate(null)}
                />
            )}
        </VoterLayout>
    );
}
