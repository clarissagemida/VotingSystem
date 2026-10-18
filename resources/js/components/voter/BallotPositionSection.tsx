import { CheckCircle2, Eye } from 'lucide-react';

import { getImageUrl } from '@/lib/utils';

import type { Candidate } from './candidate-types';

interface BallotPositionSectionProps {
    position: string;
    index: number;
    candidates: Candidate[];
    selectedId: number | null;
    onSelect: (position: string, candidateId: number) => void;
    onClear: (position: string) => void;
    onPreview: (candidate: Candidate) => void;
}

export default function BallotPositionSection({ position, index, candidates, selectedId, onSelect, onClear, onPreview }: BallotPositionSectionProps) {
    const isPositionFilled = selectedId !== null;

    return (
        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-6 py-4">
                <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2D6A4F] text-xs font-bold text-white shadow-xs">
                        {index + 1}
                    </span>
                    <div>
                        <h2 className="text-base font-bold text-gray-900 sm:text-lg">{position}</h2>
                        <p className="text-xs text-gray-500">Select 1 candidate ({candidates.length} choices available)</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isPositionFilled ? (
                        <>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#2D6A4F] ring-1 ring-emerald-200">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                Candidate Selected
                            </span>
                            <button
                                type="button"
                                onClick={() => onClear(position)}
                                className="text-xs font-semibold text-gray-400 underline underline-offset-2 transition hover:text-rose-600"
                            >
                                Clear
                            </button>
                        </>
                    ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                            Not yet selected
                        </span>
                    )}
                </div>
            </div>

            <div className="p-6">
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {candidates.map((candidate) => {
                        const isSelected = selectedId === candidate.id;

                        return (
                            <div
                                key={candidate.id}
                                onClick={() => onSelect(position, candidate.id)}
                                className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                                    isSelected
                                        ? 'border-[#2D6A4F] bg-emerald-50/40 shadow-md ring-2 ring-[#2D6A4F]/20'
                                        : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/20 hover:shadow-md'
                                }`}
                            >
                                <div className="flex items-center justify-between p-3.5 pb-2">
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                                            candidate.candidate_type === 'partylist'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-amber-100 text-amber-800'
                                        }`}
                                    >
                                        {candidate.candidate_type === 'partylist' ? 'Partylist' : 'Independent'}
                                    </span>

                                    <div
                                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                                            isSelected
                                                ? 'border-[#2D6A4F] bg-[#2D6A4F] text-white shadow-xs'
                                                : 'border-gray-300 bg-white group-hover:border-emerald-400'
                                        }`}
                                    >
                                        {isSelected && <CheckCircle2 className="h-4 w-4" />}
                                    </div>
                                </div>

                                <div className="group/photo relative mx-3 my-1 flex h-52 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-b from-gray-50 via-slate-100 to-gray-200/70 p-3">
                                    {candidate.photo ? (
                                        <>
                                            <img
                                                src={getImageUrl(candidate.photo) ?? ''}
                                                alt=""
                                                aria-hidden="true"
                                                className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-10 blur-lg transition-opacity duration-300 select-none group-hover/photo:opacity-20"
                                            />
                                            <img
                                                src={getImageUrl(candidate.photo) ?? ''}
                                                alt={candidate.candidate_name}
                                                className="relative z-10 max-h-full max-w-full rounded-lg bg-white/70 object-contain p-1 shadow-sm ring-1 ring-black/5 drop-shadow-sm transition-all duration-300 group-hover/photo:scale-[1.03]"
                                            />
                                        </>
                                    ) : (
                                        <div className="flex h-full w-full flex-col items-center justify-center">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100/80 text-xl font-black text-[#2D6A4F]">
                                                {candidate.candidate_name.charAt(0)}
                                            </div>
                                            <span className="mt-2 text-[11px] font-semibold text-gray-400">No photo provided</span>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        title="Preview candidate details"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onPreview(candidate);
                                        }}
                                        className="absolute right-2 bottom-2 z-20 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 hover:bg-black/80"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                <div className="p-4 pt-2">
                                    <h3 className="line-clamp-1 text-sm font-bold text-gray-900 transition-colors group-hover:text-[#2D6A4F]">
                                        {candidate.candidate_name}
                                    </h3>

                                    {candidate.candidate_type === 'partylist' && candidate.partylist ? (
                                        <div className="mt-1.5 flex items-center gap-1.5">
                                            <span
                                                className="h-2 w-2 shrink-0 rounded-full"
                                                style={{ backgroundColor: candidate.partylist.color || '#2D6A4F' }}
                                            />
                                            <span className="truncate text-xs font-semibold text-gray-700">{candidate.partylist.partylist_name}</span>
                                            {candidate.partylist.acronym && (
                                                <span className="py-0.2 rounded bg-gray-100 px-1 text-[10px] font-bold text-gray-500">
                                                    {candidate.partylist.acronym}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="mt-1 text-xs text-gray-500">
                                            {candidate.organization?.organization_name ?? 'Independent Candidate'}
                                        </p>
                                    )}

                                    <div className="mt-3 border-t border-gray-100 pt-2">
                                        <div
                                            className={`w-full rounded-xl py-2 text-center text-xs font-bold transition-all ${
                                                isSelected
                                                    ? 'bg-[#2D6A4F] text-white shadow-xs'
                                                    : 'bg-gray-100 text-gray-700 group-hover:bg-emerald-100 group-hover:text-[#2D6A4F]'
                                            }`}
                                        >
                                            {isSelected ? 'Selected for ' + position : 'Select Candidate'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
