import { CheckCircle2, Users, Vote } from 'lucide-react';

import type { Candidate } from './candidate-types';

export interface PartylistSlate {
    id: number;
    name: string;
    acronym: string | null;
    color: string;
    description: string | null;
    slots: Record<string, number>;
    coverage: number;
    missing: string[];
}

export function buildPartylistSlates(candidates: Candidate[], positions: string[]): PartylistSlate[] {
    const map = new Map<number, PartylistSlate>();

    candidates.forEach((c) => {
        if (c.candidate_type !== 'partylist' || !c.partylist?.id) return;

        const pl = c.partylist;
        const partylistId = pl.id as number;
        const entry = map.get(partylistId) ?? {
            id: partylistId,
            name: pl.partylist_name,
            acronym: pl.acronym ?? null,
            color: pl.color ?? '#2D6A4F',
            description: pl.description ?? null,
            slots: {} as Record<string, number>,
            coverage: 0,
            missing: [] as string[],
        };

        entry.slots[c.position_name] = c.id;
        map.set(partylistId, entry);
    });

    return [...map.values()].map((entry) => {
        const missing = positions.filter((p) => entry.slots[p] === undefined);
        return {
            ...entry,
            coverage: Object.keys(entry.slots).length,
            missing,
        };
    });
}

interface StraightPartySectionProps {
    slates: PartylistSlate[];
    totalPositions: number;
    straightPartyId: number | null;
    onSelect: (slate: PartylistSlate) => void;
    onClear: () => void;
}

export default function StraightPartySection({ slates, totalPositions, straightPartyId, onSelect, onClear }: StraightPartySectionProps) {
    if (slates.length === 0) return null;

    return (
        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gradient-to-r from-[#143728] to-[#2D6A4F] px-6 py-4 text-white">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                        <Users className="h-5 w-5 text-emerald-300" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold">Vote Straight Party</h2>
                        <p className="text-xs text-green-200/80">
                            Select one partylist to instantly fill your ballot with their full slate. You can still change individual picks after.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-5">
                {straightPartyId !== null && (
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-2.5 text-sm text-[#1B4332]">
                        <span className="font-semibold">Straight party selected — their candidates are now on your ballot.</span>
                        <button
                            type="button"
                            onClick={onClear}
                            className="text-xs font-bold text-[#2D6A4F] underline underline-offset-2 hover:text-[#1B4332]"
                        >
                            Clear straight-party selection
                        </button>
                    </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {slates.map((pl) => {
                        const isSelected = straightPartyId === pl.id;
                        const fullCoverage = pl.missing.length === 0;

                        return (
                            <div
                                key={pl.id}
                                className={`flex flex-col rounded-2xl border p-4 transition-all ${
                                    isSelected
                                        ? 'border-[#2D6A4F] bg-emerald-50/40 ring-2 ring-[#2D6A4F]/15'
                                        : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="h-4 w-4 shrink-0 rounded-full shadow ring-2 ring-white" style={{ backgroundColor: pl.color }} />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold text-gray-900">{pl.name}</p>
                                        <p className="text-[11px] font-medium text-gray-500">
                                            {pl.acronym ? `${pl.acronym} · ` : ''}
                                            {pl.coverage} of {totalPositions} positions
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onSelect(pl)}
                                    disabled={pl.coverage === 0}
                                    className={`mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                        isSelected
                                            ? 'bg-[#2D6A4F] text-white shadow-sm'
                                            : 'border border-gray-200 bg-white text-[#2D6A4F] hover:border-[#2D6A4F] hover:bg-emerald-50'
                                    }`}
                                >
                                    {isSelected ? (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" />
                                            Straight Party Selected
                                        </>
                                    ) : (
                                        <>
                                            <Vote className="h-4 w-4" />
                                            Vote Full Partylist
                                        </>
                                    )}
                                </button>

                                {!fullCoverage && (
                                    <p className="mt-2 text-[10px] leading-relaxed text-amber-700">
                                        No candidate for <strong>{pl.missing.join(', ')}</strong> — these stay blank.
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
