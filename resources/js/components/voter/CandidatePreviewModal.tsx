import { FileText, Vote, X } from 'lucide-react';

import { getImageUrl } from '@/lib/utils';

import type { Candidate } from './candidate-types';

interface CandidatePreviewModalProps {
    candidate: Candidate;
    onClose: () => void;
    /** When provided, a select/deselect button is shown inside the modal. */
    onSelect?: (candidate: Candidate) => void;
    isSelected?: boolean;
}

export default function CandidatePreviewModal({ candidate, onClose, onSelect, isSelected = false }: CandidatePreviewModalProps) {
    return (
        <div
            role="dialog"
            aria-modal="true"
            className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-200"
            onClick={onClose}
        >
            <div
                className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="mb-4">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800">
                        {candidate.position_name}
                    </span>
                    <h3 className="mt-1 text-xl font-black text-gray-900">{candidate.candidate_name}</h3>
                </div>

                <div className="relative flex h-80 w-full items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-slate-100 p-5">
                    {candidate.photo ? (
                        <>
                            <img
                                src={getImageUrl(candidate.photo) ?? ''}
                                alt=""
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-10 blur-2xl select-none"
                            />
                            <img
                                src={getImageUrl(candidate.photo) ?? ''}
                                alt={candidate.candidate_name}
                                className="relative z-10 max-h-full max-w-full rounded-xl bg-white/70 object-contain p-2 shadow-md ring-1 ring-black/5 drop-shadow-xl"
                            />
                        </>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl font-extrabold text-[#2D6A4F]">
                            {candidate.candidate_name.charAt(0)}
                        </div>
                    )}
                </div>

                <div className="mt-4 space-y-3">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                        <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">Affiliation</p>
                        <p className="text-sm font-semibold text-gray-800">{candidate.partylist?.partylist_name ?? 'Independent'}</p>
                    </div>

                    {candidate.partylist?.description && (
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                            <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-[#2D6A4F]">
                                <FileText className="h-3.5 w-3.5" />
                                Partylist Platform & Agenda
                            </div>
                            <p className="text-xs leading-relaxed whitespace-pre-line text-gray-700">{candidate.partylist.description}</p>
                        </div>
                    )}

                    {!candidate.partylist && candidate.platform && (
                        <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
                            <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-amber-700">
                                <FileText className="h-3.5 w-3.5" />
                                Candidate Platform & Advocacy
                            </div>
                            <p className="text-xs leading-relaxed whitespace-pre-line text-gray-700">{candidate.platform}</p>
                        </div>
                    )}
                </div>

                {onSelect && (
                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                onSelect(candidate);
                                onClose();
                            }}
                            className="w-full rounded-xl bg-[#2D6A4F] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#1B4332]"
                        >
                            {isSelected ? 'Deselect Candidate' : `Select ${candidate.candidate_name}`}
                            {!isSelected && <Vote className="ml-2 inline h-4 w-4" />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
