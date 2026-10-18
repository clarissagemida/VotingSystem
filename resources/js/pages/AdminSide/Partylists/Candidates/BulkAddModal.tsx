import { router } from '@inertiajs/react';
import { CheckCircle2, Image as ImageIcon, Layers3, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import { PRIMARY, type Partylist, type Position } from '@/lib/candidates';

interface BulkCandidate {
    position_name: string;
    candidate_name: string;
    photo: File | null;
}

interface Props {
    open: boolean;
    partylist: Partylist;
    slots: Position[];
    onClose: () => void;
}

export default function BulkAddModal({ open, partylist, slots, onClose }: Props) {
    const [bulkCandidates, setBulkCandidates] = useState<BulkCandidate[]>([]);

    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (open) {
            setBulkCandidates(
                slots.map((position) => ({
                    position_name: position.position_name,
                    candidate_name: '',
                    photo: null,
                })),
            );
        }
    }, [open, slots]);

    const updateName = (index: number, value: string) => {
        setBulkCandidates((previous) => previous.map((candidate, i) => (i === index ? { ...candidate, candidate_name: value } : candidate)));
    };

    const updatePhoto = (index: number, file: File | undefined) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Image',
                text: 'Please select a valid image.',
                confirmButtonColor: PRIMARY,
            });
            return;
        }

        if (file.size > 4 * 1024 * 1024) {
            Swal.fire({
                icon: 'warning',
                title: 'File Too Large',
                text: 'Each candidate photo must not exceed 4MB.',
                confirmButtonColor: PRIMARY,
            });
            return;
        }

        setBulkCandidates((previous) => previous.map((candidate, i) => (i === index ? { ...candidate, photo: file } : candidate)));
    };

    const closeModal = () => {
        if (processing) return;

        setBulkCandidates([]);
        onClose();
    };

    const submitBulk = (event: FormEvent) => {
        event.preventDefault();

        if (processing || bulkCandidates.length === 0) {
            return;
        }

        const missing = bulkCandidates.find((candidate) => !candidate.candidate_name.trim());

        if (missing) {
            Swal.fire({
                icon: 'warning',
                title: 'Incomplete Partylist',
                text: `Please enter a candidate for ${missing.position_name}.`,
                confirmButtonColor: PRIMARY,
            });
            return;
        }

        setProcessing(true);

        const formData = new FormData();

        bulkCandidates.forEach((candidate, index) => {
            formData.append(`candidates[${index}][candidate_name]`, candidate.candidate_name.trim());

            formData.append(`candidates[${index}][position_name]`, candidate.position_name);

            if (candidate.photo) {
                formData.append(`candidates[${index}][photo]`, candidate.photo);
            }
        });

        router.post(`/admin/partylists/${partylist.id}/candidates/bulk`, formData, {
            forceFormData: true,
            preserveScroll: true,

            onSuccess: () => {
                setProcessing(false);
                setBulkCandidates([]);
                onClose();
            },

            onError: (errors) => {
                setProcessing(false);

                const firstError = Object.values(errors)[0];

                Swal.fire({
                    icon: 'error',
                    title: 'Unable to Add Partylist',
                    text: typeof firstError === 'string' ? firstError : 'Please check all candidate information.',
                    confirmButtonColor: PRIMARY,
                });
            },

            onFinish: () => setProcessing(false),
        });
    };

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-md sm:p-5">
            <div className="flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.30)]">
                {/* HEADER */}
                <div className="shrink-0 border-b border-slate-200 bg-gradient-to-r from-white via-slate-50 to-[#F0F7F3] px-5 py-5 sm:px-7">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1B4332] text-white shadow-md">
                                <Layers3 size={20} />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">Add Full Partylist</h2>

                                <p className="mt-1 text-xs font-semibold text-slate-500">Add candidates for every available position.</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={closeModal}
                            disabled={processing}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Close modal"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* SUMMARY */}
                    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[#1B4332]/10 bg-[#1B4332]/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-bold text-[#1B4332]">Partylist</p>

                            <p className="mt-0.5 text-sm font-black text-slate-950">{partylist.partylist_name}</p>
                        </div>

                        <div className="w-fit rounded-full bg-[#1B4332] px-3 py-1.5 text-xs font-black text-white">
                            {bulkCandidates.length} position
                            {bulkCandidates.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>

                {/* FORM */}
                <form onSubmit={submitBulk} className="min-h-0 flex-1 overflow-hidden">
                    <div className="max-h-[68vh] overflow-y-auto bg-white p-5 sm:p-7">
                        {/* INFORMATION */}
                        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                                    <Layers3 size={18} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-black text-blue-900">{bulkCandidates.length} positions are available.</p>

                                    <p className="mt-1 text-xs leading-5 font-medium text-blue-700">
                                        Enter a candidate name for every available position. All candidate names are required before submitting.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CANDIDATE FIELDS */}
                        <div className="space-y-4">
                            {bulkCandidates.map((candidate, index) => (
                                <div
                                    key={candidate.position_name}
                                    className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 transition hover:border-[#1B4332]/30 hover:bg-white hover:shadow-sm sm:p-5"
                                >
                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[200px_minmax(0,1fr)_140px] lg:items-end">
                                        {/* POSITION */}
                                        <div>
                                            <label className="mb-2 block text-[10px] font-black tracking-widest text-slate-500 uppercase">
                                                Position
                                            </label>

                                            <div className="flex min-h-[52px] items-center rounded-xl border border-[#1B4332]/10 bg-[#1B4332]/5 px-4 py-3">
                                                <p className="text-sm font-black text-[#1B4332]">{candidate.position_name}</p>
                                            </div>
                                        </div>

                                        {/* NAME */}
                                        <div>
                                            <label
                                                htmlFor={`bulk-candidate-${index}`}
                                                className="mb-2 block text-[10px] font-black tracking-widest text-slate-500 uppercase"
                                            >
                                                Candidate Name
                                                <span className="ml-1 text-red-600">*</span>
                                            </label>

                                            <input
                                                id={`bulk-candidate-${index}`}
                                                type="text"
                                                value={candidate.candidate_name}
                                                onChange={(e) => updateName(index, e.target.value)}
                                                placeholder={`Enter ${candidate.position_name} name`}
                                                disabled={processing}
                                                autoComplete="off"
                                                className="min-h-[52px] w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-[15px] font-bold text-slate-950 caret-[#1B4332] shadow-sm transition outline-none selection:bg-[#1B4332]/20 placeholder:font-medium placeholder:text-slate-400 focus:border-[#1B4332] focus:bg-white focus:ring-4 focus:ring-[#1B4332]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                                            />

                                            {candidate.candidate_name && (
                                                <p className="mt-1.5 text-[11px] font-semibold text-emerald-600">✓ Name entered</p>
                                            )}
                                        </div>

                                        {/* PHOTO */}
                                        <label
                                            className={`flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                                                candidate.photo ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#1B4332] hover:bg-[#143728]'
                                            }`}
                                        >
                                            <ImageIcon size={16} />

                                            {candidate.photo ? 'Change Photo' : 'Choose Photo'}

                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                                onChange={(e) => updatePhoto(index, e.target.files?.[0])}
                                                className="hidden"
                                                disabled={processing}
                                            />
                                        </label>
                                    </div>

                                    {/* PHOTO FILE */}
                                    {candidate.photo && (
                                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2">
                                            <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />

                                            <p className="truncate text-xs font-bold text-emerald-700">{candidate.photo.name}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:flex-row sm:justify-end sm:px-7">
                        <button
                            type="button"
                            onClick={closeModal}
                            disabled={processing}
                            className="min-h-[50px] rounded-xl border-2 border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={processing || bulkCandidates.length === 0}
                            className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-[#1B4332] px-6 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#143728] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Saving Partylist...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={18} />
                                    Add Full Partylist
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
