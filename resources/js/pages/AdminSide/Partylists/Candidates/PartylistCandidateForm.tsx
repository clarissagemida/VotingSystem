import { router } from '@inertiajs/react';
import { CheckCircle2, Image as ImageIcon, UserRound } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import {
    EMPTY_CANDIDATE_FORM,
    PRIMARY,
    getCandidatePhotoUrl,
    type Candidate,
    type CandidateForm as CandidateFormValues,
    type Partylist,
    type Position,
} from '@/lib/candidates';

interface Props {
    mode: 'create' | 'edit';
    partylist: Partylist;
    positions?: Position[];
    candidate?: Candidate;
}

export default function PartylistCandidateForm({ mode, partylist, positions = [], candidate }: Props) {
    const positionList = [...positions].sort((a, b) => Number(a.position_order) - Number(b.position_order));

    const [form, setForm] = useState<CandidateFormValues>(() =>
        candidate
            ? {
                  candidate_name: candidate.candidate_name ?? '',
                  position_name: candidate.position_name ?? '',
                  platform: '',
                  election_id: '',
                  organization_id: '',
                  photo: null,
              }
            : { ...EMPTY_CANDIDATE_FORM },
    );

    const [photoPreview, setPhotoPreview] = useState<string | null>(() => getCandidatePhotoUrl(candidate?.photo));

    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        return () => {
            if (photoPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(photoPreview);
            }
        };
    }, [photoPreview]);

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;

        setForm((previous) => ({ ...previous, [name]: value }));
    };

    const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Image',
                text: 'Please select a valid image file.',
            });
            event.target.value = '';
            return;
        }

        if (file.size > 4 * 1024 * 1024) {
            Swal.fire({
                icon: 'warning',
                title: 'File Too Large',
                text: 'The candidate photo must not exceed 4MB.',
            });
            event.target.value = '';
            return;
        }

        setForm((previous) => ({ ...previous, photo: file }));
        setPhotoPreview(URL.createObjectURL(file));
    };

    const removePhoto = () => {
        if (photoPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(photoPreview);
        }

        setForm((previous) => ({ ...previous, photo: null }));
        setPhotoPreview(null);
    };

    const validate = (): boolean => {
        if (!form.candidate_name.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Candidate Name Required',
                text: "Please enter the candidate's complete name.",
            });
            return false;
        }

        if (!form.position_name.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Position Required',
                text: 'Please select a position.',
            });
            return false;
        }

        return true;
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        if (processing || !validate()) {
            return;
        }

        setProcessing(true);

        const formData = new FormData();

        formData.append('candidate_name', form.candidate_name.trim());
        formData.append('position_name', form.position_name.trim());

        if (form.photo) {
            formData.append('photo', form.photo);
        }

        const editing = mode === 'edit' ? candidate : undefined;

        if (editing) {
            formData.append('_method', 'PUT');
        }

        router.post(
            editing ? `/admin/partylists/${partylist.id}/candidates/${editing.id}` : `/admin/partylists/${partylist.id}/candidates`,
            formData,
            {
                forceFormData: true,

                onSuccess: () => router.visit(`/admin/partylists/${partylist.id}/candidates`),

                onError: (errors) => {
                    const firstError = Object.values(errors)[0];

                    Swal.fire({
                        icon: 'error',
                        title: 'Unable to Save Candidate',
                        text: typeof firstError === 'string' ? firstError : 'Please check the candidate information.',
                        confirmButtonColor: PRIMARY,
                    });
                },

                onFinish: () => setProcessing(false),
            },
        );
    };

    const isEdit = mode === 'edit';

    return (
        <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4 sm:px-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B4332] text-white shadow-sm">
                    <UserRound size={19} />
                </div>

                <div>
                    <h1 className="text-base font-bold text-gray-900 sm:text-lg">{isEdit ? 'Edit Candidate' : 'Add Candidate'}</h1>
                    <p className="mt-0.5 text-[11px] text-gray-500">
                        {partylist.partylist_name}
                        {partylist.acronym ? ` (${partylist.acronym})` : ''}
                    </p>
                </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
                {/* CANDIDATE INFORMATION */}
                <section>
                    <div className="mb-3">
                        <h3 className="text-sm font-bold text-gray-900">Candidate Information</h3>
                        <p className="mt-0.5 text-[11px] text-gray-500">Provide the candidate's details and assigned position.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="mb-1.5 block text-xs font-bold text-gray-700">
                                Candidate Name
                                <span className="ml-1 text-red-500">*</span>
                            </label>

                            <input
                                type="text"
                                name="candidate_name"
                                value={form.candidate_name}
                                onChange={handleChange}
                                disabled={processing}
                                autoFocus
                                placeholder="Enter candidate's complete name"
                                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-[#1B4332] focus:ring-3 focus:ring-[#1B4332]/10 disabled:bg-gray-100"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-1.5 block text-xs font-bold text-gray-700">
                                Position
                                <span className="ml-1 text-red-500">*</span>
                            </label>

                            <select
                                name="position_name"
                                value={form.position_name}
                                onChange={handleChange}
                                disabled={processing}
                                className="h-11 w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-900 transition outline-none focus:border-[#1B4332] focus:ring-3 focus:ring-[#1B4332]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                            >
                                <option value="">Select Position</option>

                                {positionList.map((position) => (
                                    <option key={position.id} value={position.position_name}>
                                        {position.position_name}
                                    </option>
                                ))}
                            </select>

                            <p className="mt-1.5 text-[10px] text-gray-500">Select the position this candidate is running for.</p>
                        </div>
                    </div>
                </section>

                {/* PHOTO */}
                <section className="border-t border-gray-100 pt-5">
                    <div className="mb-3">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-900">Candidate Photo</h3>

                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-bold tracking-wide text-gray-500 uppercase">
                                Optional
                            </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-gray-500">Upload an official photo for easier candidate identification.</p>
                    </div>

                    <div className="grid gap-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 sm:grid-cols-[auto_1fr] sm:items-center">
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-[#1B4332] shadow-lg ring-1 ring-gray-200">
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview}
                                            alt="Candidate preview"
                                            className="h-full w-full object-cover"
                                            onError={() => setPhotoPreview(null)}
                                        />
                                    ) : (
                                        <UserRound size={42} className="text-white/90" />
                                    )}
                                </div>

                                {photoPreview && (
                                    <button
                                        type="button"
                                        onClick={removePhoto}
                                        disabled={processing}
                                        className="absolute -top-2 -right-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-red-600 text-white shadow-md transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        title="Remove photo"
                                    >
                                        <UserRound size={13} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="text-center sm:text-left">
                            <p className="text-sm font-bold text-gray-800">{photoPreview ? 'Candidate photo selected' : 'No candidate photo'}</p>

                            <p className="mt-1 max-w-md text-[11px] leading-5 text-gray-500">
                                Use a clear and professional candidate photo. Supported formats: PNG, JPG, JPEG, and WEBP.
                            </p>

                            <p className="mt-1 text-[10px] font-semibold text-gray-400">Maximum file size: 4MB</p>

                            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#1B4332] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#143728] active:scale-95">
                                <ImageIcon size={15} />

                                {photoPreview ? 'Change Photo' : 'Choose Photo'}

                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    onChange={handlePhotoChange}
                                    disabled={processing}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                </section>
            </div>

            {/* FOOTER */}
            <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-gray-200 bg-white px-5 py-3.5 sm:flex-row sm:justify-end sm:px-6">
                <button
                    type="button"
                    onClick={() => router.visit(`/admin/partylists/${partylist.id}/candidates`)}
                    disabled={processing}
                    className="min-h-[42px] cursor-pointer rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1B4332] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#143728] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {processing ? (
                        <>
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 size={16} />
                            {isEdit ? 'Update Candidate' : 'Add Candidate'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
