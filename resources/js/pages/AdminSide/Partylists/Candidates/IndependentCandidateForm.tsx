import { router } from '@inertiajs/react';
import { CheckCircle2, Image as ImageIcon, UserRound } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

import {
    EMPTY_CANDIDATE_FORM,
    PRIMARY,
    getCandidatePhotoUrl,
    type Candidate,
    type CandidateForm as CandidateFormValues,
    type Election,
    type Organization,
    type Position,
} from '@/lib/candidates';

interface Props {
    mode: 'create' | 'edit';
    elections: Election[];
    organizations: Organization[];
    positions?: Position[];
    candidate?: Candidate;
}

export default function IndependentCandidateForm({ mode, elections, organizations, positions = [], candidate }: Props) {
    const [form, setForm] = useState<CandidateFormValues>(() =>
        candidate
            ? {
                  candidate_name: candidate.candidate_name ?? '',
                  position_name: candidate.position_name ?? '',
                  platform: candidate.platform ?? '',
                  election_id: candidate.election_id ? String(candidate.election_id) : '',
                  organization_id: candidate.organization_id ? String(candidate.organization_id) : '',
                  photo: null,
              }
            : { ...EMPTY_CANDIDATE_FORM },
    );

    const [photoPreview, setPhotoPreview] = useState<string | null>(() => getCandidatePhotoUrl(candidate?.photo));

    const [processing, setProcessing] = useState(false);

    const availablePositions = useMemo(() => {
        const selectedOrganization = organizations.find((organization) => String(organization.id) === String(form.organization_id));

        if (selectedOrganization?.positions && selectedOrganization.positions.length > 0) {
            return [...selectedOrganization.positions].sort((a, b) => (a.position_order ?? 999) - (b.position_order ?? 999));
        }

        return [...positions].sort((a, b) => (a.position_order ?? 999) - (b.position_order ?? 999));
    }, [organizations, positions, form.organization_id]);

    useEffect(() => {
        return () => {
            if (photoPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(photoPreview);
            }
        };
    }, [photoPreview]);

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;

        if (name === 'organization_id') {
            setForm((previous) => ({
                ...previous,
                organization_id: value,
                position_name: '',
            }));
            return;
        }

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
                text: 'Candidate photo must not exceed 4MB.',
            });
            event.target.value = '';
            return;
        }

        if (photoPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(photoPreview);
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
                text: "Please select the candidate's position.",
            });
            return false;
        }

        if (!form.election_id) {
            Swal.fire({
                icon: 'warning',
                title: 'Election Required',
                text: 'Please select an election.',
            });
            return false;
        }

        if (!form.organization_id) {
            Swal.fire({
                icon: 'warning',
                title: 'Organization Required',
                text: 'Please select an organization.',
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
        formData.append('election_id', form.election_id);
        formData.append('organization_id', form.organization_id);
        formData.append('partylist_id', '');
        formData.append('is_independent', '1');

        if (form.platform.trim()) {
            formData.append('platform', form.platform.trim());
        }

        if (form.photo) {
            formData.append('photo', form.photo);
        }

        const editing = mode === 'edit' ? candidate : undefined;

        if (editing) {
            formData.append('_method', 'PUT');
        }

        router.post(editing ? `/admin/independent-candidates/${editing.id}` : '/admin/independent-candidates', formData, {
            forceFormData: true,

            onSuccess: () => router.visit('/admin/independent-candidates'),

            onError: (errors) => {
                const firstError = Object.values(errors)[0];

                Swal.fire({
                    icon: 'error',
                    title: editing ? 'Update Failed' : 'Unable to Add Candidate',
                    text: typeof firstError === 'string' ? firstError : 'Please check the form and try again.',
                    confirmButtonColor: PRIMARY,
                });
            },

            onFinish: () => setProcessing(false),
        });
    };

    const isEdit = mode === 'edit';

    return (
        <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4 sm:px-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B4332] text-white shadow-sm">
                    <UserRound size={19} />
                </div>

                <div>
                    <h1 className="text-base font-bold text-gray-900 sm:text-lg">
                        {isEdit ? 'Edit Independent Candidate' : 'Add Independent Candidate'}
                    </h1>
                    <p className="mt-0.5 text-[11px] text-gray-500">Register a candidate without partylist affiliation.</p>
                </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
                {/* CANDIDATE INFORMATION */}
                <section>
                    <div className="mb-3">
                        <h3 className="text-sm font-bold text-gray-900">Candidate Information</h3>
                        <p className="mt-0.5 text-[11px] text-gray-500">Provide the basic information of the independent candidate.</p>
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

                        <div>
                            <label className="mb-1.5 block text-xs font-bold text-gray-700">
                                Election
                                <span className="ml-1 text-red-500">*</span>
                            </label>

                            <select
                                name="election_id"
                                value={form.election_id}
                                onChange={handleChange}
                                disabled={processing}
                                className="h-11 w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-900 transition outline-none focus:border-[#1B4332] focus:ring-3 focus:ring-[#1B4332]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                            >
                                <option value="">Select Election</option>

                                {elections.map((election) => (
                                    <option key={election.id} value={election.id}>
                                        {election.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-bold text-gray-700">
                                Organization
                                <span className="ml-1 text-red-500">*</span>
                            </label>

                            <select
                                name="organization_id"
                                value={form.organization_id}
                                onChange={handleChange}
                                disabled={processing}
                                className="h-11 w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-900 transition outline-none focus:border-[#1B4332] focus:ring-3 focus:ring-[#1B4332]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                            >
                                <option value="">Select Organization</option>

                                {organizations.map((organization) => (
                                    <option key={organization.id} value={organization.id}>
                                        {organization.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-1.5 block text-xs font-bold text-gray-700">
                                Position
                                <span className="ml-1 text-red-500">*</span>
                            </label>

                            {availablePositions.length > 0 ? (
                                <select
                                    name="position_name"
                                    value={form.position_name}
                                    onChange={handleChange}
                                    disabled={processing}
                                    className="h-11 w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-900 transition outline-none focus:border-[#1B4332] focus:ring-3 focus:ring-[#1B4332]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                                >
                                    <option value="">Select Position</option>

                                    {availablePositions.map((position) => (
                                        <option key={position.id} value={position.position_name}>
                                            {position.position_name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    name="position_name"
                                    value={form.position_name}
                                    onChange={handleChange}
                                    disabled={processing}
                                    placeholder="Enter candidate position"
                                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-[#1B4332] focus:ring-3 focus:ring-[#1B4332]/10 disabled:bg-gray-100"
                                />
                            )}

                            <p className="mt-1.5 text-[10px] text-gray-500">Select the position the candidate is running for.</p>
                        </div>
                    </div>
                </section>

                {/* INDEPENDENT STATUS */}
                <section className="overflow-hidden rounded-xl border border-[#CFE2D5] bg-[#F3F8F4]">
                    <div className="flex items-start gap-3 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B4332] text-white shadow-sm">
                            <UserRound size={17} />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-xs font-bold text-[#143728]">Independent Candidate</h3>

                                <span className="rounded-full bg-[#DCEDE2] px-2 py-0.5 text-[9px] font-bold tracking-wide text-[#1B4332] uppercase">
                                    No Partylist
                                </span>
                            </div>

                            <p className="mt-1 text-[11px] leading-5 text-green-800/75">
                                This candidate will be registered independently and will not be connected to any partylist.
                            </p>
                        </div>
                    </div>
                </section>

                {/* PLATFORM */}
                <section className="border-t border-gray-100 pt-5">
                    <div className="mb-3">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-900">Platform / Description</h3>

                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-bold tracking-wide text-gray-500 uppercase">
                                Optional
                            </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-gray-500">Describe the candidate's platform, advocacy, or short bio.</p>
                    </div>

                    <textarea
                        name="platform"
                        value={form.platform}
                        onChange={handleChange}
                        rows={3}
                        disabled={processing}
                        placeholder="e.g. Promoting student welfare, academic excellence, and campus safety..."
                        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm font-medium text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-[#1B4332] focus:ring-3 focus:ring-[#1B4332]/10 disabled:bg-gray-100"
                    />
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
                    onClick={() => router.visit('/admin/independent-candidates')}
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
