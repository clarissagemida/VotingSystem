import { AlertCircle, CheckCircle2, Shield, Vote, X } from 'lucide-react';

import { getImageUrl } from '@/lib/utils';

import type { Candidate } from './candidate-types';

interface BallotReviewModalProps {
    positions: string[];
    candidates: Candidate[];
    selections: Record<string, number | null>;
    selectedCount: number;
    editingPosition: string | null;
    submitting: boolean;
    onEdit: (position: string) => void;
    onDoneEditing: () => void;
    onSelect: (position: string, candidateId: number) => void;
    onClear: (position: string) => void;
    onClose: () => void;
    onConfirm: () => void;
}

export default function BallotReviewModal({
    positions,
    candidates,
    selections,
    selectedCount,
    editingPosition,
    submitting,
    onEdit,
    onDoneEditing,
    onSelect,
    onClear,
    onClose,
    onConfirm,
}: BallotReviewModalProps) {
    const totalPositions = positions.length;

    const getCandidate = (id: number | null): Candidate | null => (id === null ? null : (candidates.find((c) => c.id === id) ?? null));

    return (
        <div
            role="dialog"
            aria-modal="true"
            className="animate-in fade-in fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 backdrop-blur-xs duration-200 sm:items-center"
            onClick={onClose}
        >
            <div
                className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="border-b border-gray-100 bg-gradient-to-r from-[#143728] to-[#2D6A4F] px-6 py-5 text-white">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                            <Shield className="h-5 w-5 text-emerald-300" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black">Review Your Ballot</h3>
                            <p className="text-xs text-green-200/80">
                                Preview all selected candidates. You can change or clear any pick before submitting.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-3">
                        <span className="text-sm font-semibold text-gray-700">
                            {selectedCount} of {totalPositions} position{totalPositions !== 1 ? 's' : ''} selected
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-[#2D6A4F]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Ballot Ready to Submit
                        </span>
                    </div>

                    <div className="mt-5 space-y-3">
                        {positions.map((position, idx) => {
                            const selectedCandidate = getCandidate(selections[position]);
                            const filled = selectedCandidate !== null;
                            const positionCandidates = candidates.filter((c) => c.position_name === position);
                            const isEditing = editingPosition === position;

                            return (
                                <div
                                    key={position}
                                    className={`rounded-2xl border p-4 ${
                                        isEditing
                                            ? 'border-[#2D6A4F] bg-white ring-2 ring-[#2D6A4F]/10'
                                            : filled
                                              ? 'border-emerald-200 bg-emerald-50/40'
                                              : 'border-dashed border-gray-300 bg-gray-50/60'
                                    }`}
                                >
                                    {!isEditing ? (
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                            <div className="flex items-center gap-3 sm:min-w-[220px] sm:flex-1">
                                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2D6A4F] text-xs font-bold text-white">
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{position}</p>
                                                    <p className="text-[11px] text-gray-500">
                                                        {filled ? 'Selection confirmed' : 'No selection made'}
                                                    </p>
                                                </div>
                                            </div>

                                            {filled && selectedCandidate ? (
                                                <div className="flex flex-1 items-center gap-3 sm:justify-end">
                                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                                                        {selectedCandidate.photo ? (
                                                            <img
                                                                src={getImageUrl(selectedCandidate.photo) ?? ''}
                                                                alt={selectedCandidate.candidate_name}
                                                                className="h-full w-full object-contain p-0.5"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center bg-emerald-100 text-base font-bold text-[#2D6A4F]">
                                                                {selectedCandidate.candidate_name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 text-right">
                                                        <p className="truncate text-sm font-bold text-gray-900">{selectedCandidate.candidate_name}</p>
                                                        <p className="truncate text-[11px] text-gray-500">
                                                            {selectedCandidate.candidate_type === 'partylist'
                                                                ? (selectedCandidate.partylist?.partylist_name ?? 'Partylist')
                                                                : (selectedCandidate.organization?.organization_name ?? 'Independent')}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 sm:justify-end">
                                                    <AlertCircle className="h-3.5 w-3.5" />
                                                    Not answered
                                                </span>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => onEdit(position)}
                                                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-[#2D6A4F] transition hover:border-[#2D6A4F] hover:bg-emerald-50"
                                            >
                                                {filled ? 'Change' : 'Select'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="mb-3 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#2D6A4F] text-xs font-bold text-white">
                                                        {idx + 1}
                                                    </span>
                                                    <p className="text-sm font-bold text-gray-900">{position}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => onClear(position)}
                                                    className="text-xs font-semibold text-rose-600 hover:underline"
                                                >
                                                    Clear selection
                                                </button>
                                            </div>

                                            <div className="space-y-2">
                                                {positionCandidates.map((candidate) => {
                                                    const isSelected = selections[position] === candidate.id;
                                                    return (
                                                        <button
                                                            key={candidate.id}
                                                            type="button"
                                                            onClick={() => onSelect(position, candidate.id)}
                                                            className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                                                                isSelected
                                                                    ? 'border-[#2D6A4F] bg-emerald-50 ring-2 ring-[#2D6A4F]/15'
                                                                    : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30'
                                                            }`}
                                                        >
                                                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                                                                {candidate.photo ? (
                                                                    <img
                                                                        src={getImageUrl(candidate.photo) ?? ''}
                                                                        alt={candidate.candidate_name}
                                                                        className="h-full w-full object-contain p-0.5"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center bg-emerald-100 text-sm font-bold text-[#2D6A4F]">
                                                                        {candidate.candidate_name.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-bold text-gray-900">{candidate.candidate_name}</p>
                                                                <p className="truncate text-[11px] text-gray-500">
                                                                    {candidate.candidate_type === 'partylist'
                                                                        ? (candidate.partylist?.partylist_name ?? 'Partylist')
                                                                        : (candidate.organization?.organization_name ?? 'Independent')}
                                                                </p>
                                                            </div>
                                                            <div
                                                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                                                    isSelected
                                                                        ? 'border-[#2D6A4F] bg-[#2D6A4F] text-white'
                                                                        : 'border-gray-300 bg-white'
                                                                }`}
                                                            >
                                                                {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={onDoneEditing}
                                                className="mt-3 w-full rounded-lg border border-gray-200 bg-gray-50 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-100"
                                            >
                                                Done
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {positions.some((p) => selections[p] === null) && (
                        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>
                                You left <strong>{positions.filter((p) => selections[p] === null).length}</strong> position(s) blank. Once submitted,
                                you cannot vote for them later.
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-4 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                    >
                        Keep Editing
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={submitting || selectedCount === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#1B4332] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Vote className="h-4 w-4" />
                        {submitting ? 'Submitting...' : 'Confirm & Submit Ballot'}
                    </button>
                </div>
            </div>
        </div>
    );
}
