import { router } from '@inertiajs/react';
import { CheckCircle2, Image as ImageIcon, Vote } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';
import Swal from 'sweetalert2';

import {
    EMPTY_FORM,
    PARTY_COLORS,
    PRIMARY,
    getPartylistLogoUrl,
    type Election,
    type Organization,
    type Partylist,
    type PartylistForm as PartylistFormValues,
} from '@/lib/partylists';

interface Props {
    mode: 'create' | 'edit';
    elections: Election[];
    organizations: Organization[];
    partylist?: Partylist;
}

export default function PartylistForm({ mode, elections, organizations, partylist }: Props) {
    const [form, setForm] = useState<PartylistFormValues>(() =>
        partylist
            ? {
                  partylist_name: partylist.partylist_name ?? '',
                  acronym: partylist.acronym ?? '',
                  election_id: String(partylist.election_id ?? ''),
                  organization_id: partylist.organization_id ? String(partylist.organization_id) : '',
                  color: partylist.color ?? PRIMARY,
                  description: partylist.description ?? '',
                  logo: null,
                  banner: null,
              }
            : { ...EMPTY_FORM },
    );

    const [preview, setPreview] = useState<string | null>(() => getPartylistLogoUrl(partylist?.logo));

    const [processing, setProcessing] = useState(false);

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = event.target;

        setForm((previous) => ({ ...previous, [name]: value }));
    };

    const handleColorChange = (color: string) => {
        setForm((previous) => ({ ...previous, color }));
    };

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
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
                text: 'The partylist logo must not exceed 4MB.',
            });

            event.target.value = '';
            return;
        }

        setForm((previous) => ({ ...previous, logo: file }));
        setPreview(URL.createObjectURL(file));
    };

    const validate = (): boolean => {
        if (!form.partylist_name.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Partylist Name Required',
                text: 'Please enter the partylist name.',
            });
            return false;
        }

        if (!form.acronym.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Acronym Required',
                text: 'Please enter the partylist acronym.',
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

        formData.append('partylist_name', form.partylist_name.trim());
        formData.append('acronym', form.acronym.trim().toUpperCase());
        formData.append('election_id', form.election_id);
        formData.append('organization_id', form.organization_id);
        formData.append('color', form.color);
        formData.append('description', form.description.trim());

        if (form.logo) {
            formData.append('logo', form.logo);
        }

        const isEdit = mode === 'edit' && partylist;

        if (isEdit) {
            formData.append('_method', 'PUT');
        }

        router.post(isEdit ? `/admin/partylists/${partylist.id}` : '/admin/partylists', formData, {
            forceFormData: true,

            onSuccess: () => router.visit('/admin/partylists'),

            onError: (errors) => {
                const firstError = Object.values(errors)[0];

                Swal.fire({
                    icon: 'error',
                    title: 'Unable to Save Partylist',
                    text: typeof firstError === 'string' ? firstError : 'Please check the form and try again.',
                });
            },

            onFinish: () => setProcessing(false),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4 sm:px-6">
                <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                    style={{ backgroundColor: form.color }}
                >
                    <Vote size={19} />
                </div>

                <div>
                    <h1 className="text-base font-bold text-gray-900 sm:text-lg">{mode === 'edit' ? 'Edit Partylist' : 'Add Partylist'}</h1>
                    <p className="mt-0.5 text-[11px] text-gray-500">
                        {mode === 'edit' ? 'Update the partylist information.' : 'Create a new partylist.'}
                    </p>
                </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
                {/* PARTY INFORMATION */}
                <section>
                    <div className="mb-3">
                        <h3 className="text-sm font-bold text-gray-900">Party Information</h3>
                        <p className="mt-0.5 text-[11px] text-gray-500">Basic identity of the partylist.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-xs font-bold text-gray-700">
                                Partylist Name
                                <span className="ml-1 text-red-500">*</span>
                            </label>

                            <input
                                type="text"
                                name="partylist_name"
                                value={form.partylist_name}
                                onChange={handleChange}
                                disabled={processing}
                                placeholder="Enter partylist name"
                                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-[#1B4332] focus:ring-3 focus:ring-[#1B4332]/10 disabled:bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-bold text-gray-700">
                                Acronym
                                <span className="ml-1 text-red-500">*</span>
                            </label>

                            <input
                                type="text"
                                name="acronym"
                                value={form.acronym}
                                onChange={handleChange}
                                maxLength={50}
                                disabled={processing}
                                placeholder="e.g. STUDENT"
                                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm font-bold text-gray-900 uppercase transition outline-none placeholder:font-medium placeholder:text-gray-400 focus:border-[#1B4332] focus:ring-3 focus:ring-[#1B4332]/10 disabled:bg-gray-100"
                            />
                        </div>
                    </div>
                </section>

                {/* ELECTION */}
                <section className="border-t border-gray-100 pt-5">
                    <div className="mb-3">
                        <h3 className="text-sm font-bold text-gray-900">Election Assignment</h3>
                        <p className="mt-0.5 text-[11px] text-gray-500">Select the election and organization.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
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
                    </div>
                </section>

                {/* COLOR */}
                <section className="border-t border-gray-100 pt-5">
                    <div className="mb-3">
                        <h3 className="text-sm font-bold text-gray-900">Partylist Appearance</h3>
                        <p className="mt-0.5 text-[11px] text-gray-500">Choose the color used to identify this partylist.</p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-4 flex items-center gap-3">
                            <div
                                className="h-11 w-11 shrink-0 rounded-lg border border-white shadow-sm ring-1 ring-gray-200"
                                style={{ backgroundColor: form.color }}
                            />

                            <div>
                                <p className="text-xs font-bold text-gray-800">Selected Color</p>
                                <p className="mt-0.5 font-mono text-[10px] font-semibold text-gray-500 uppercase">{form.color}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {PARTY_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    title={`Select ${color}`}
                                    onClick={() => handleColorChange(color)}
                                    disabled={processing}
                                    className={`h-7 w-7 cursor-pointer rounded-full border transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50 ${
                                        form.color === color
                                            ? 'border-gray-900 ring-2 ring-gray-400 ring-offset-1'
                                            : 'border-white shadow-sm ring-1 ring-gray-200'
                                    }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>

                        <div className="mt-4 flex items-center gap-3 border-t border-gray-200 pt-3">
                            <span className="text-xs font-semibold text-gray-600">Custom Color</span>

                            <input
                                type="color"
                                value={form.color}
                                onChange={(event) => handleColorChange(event.target.value)}
                                disabled={processing}
                                className="h-8 w-12 cursor-pointer rounded-md border border-gray-300 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>
                </section>

                {/* DESCRIPTION */}
                <section className="border-t border-gray-100 pt-5">
                    <label className="mb-1.5 block text-xs font-bold text-gray-700">Description</label>

                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={3}
                        disabled={processing}
                        placeholder="Enter a short description about the partylist..."
                        className="w-full resize-none rounded-lg border border-gray-300 px-3.5 py-3 text-sm font-medium text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-[#1B4332] focus:ring-3 focus:ring-[#1B4332]/10 disabled:bg-gray-100"
                    />
                </section>

                {/* LOGO */}
                <section className="border-t border-gray-100 pt-5">
                    <div className="mb-3">
                        <h3 className="text-sm font-bold text-gray-900">Partylist Logo</h3>
                        <p className="mt-0.5 text-[11px] text-gray-500">Upload the official partylist logo.</p>
                    </div>

                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
                        <div className="flex flex-col items-center">
                            <div
                                className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border border-white shadow-md ring-1 ring-gray-200"
                                style={{ backgroundColor: form.color }}
                            >
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Partylist logo preview"
                                        className="h-full w-full bg-white object-contain p-2"
                                        onError={() => setPreview(null)}
                                    />
                                ) : (
                                    <ImageIcon size={35} className="text-white/90" />
                                )}
                            </div>

                            <p className="mt-3 text-xs font-bold text-gray-800">{preview ? 'Logo Selected' : 'No Logo Selected'}</p>

                            <p className="mt-1 text-center text-[10px] leading-4 text-gray-500">
                                PNG, JPG, JPEG or WEBP
                                <br />
                                Maximum 4MB
                            </p>

                            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#1B4332] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#143728] active:scale-95">
                                <ImageIcon size={15} />

                                {preview ? 'Change Logo' : 'Choose Logo'}

                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    onChange={handleImageChange}
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
                    onClick={() => router.visit('/admin/partylists')}
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
                            {mode === 'edit' ? 'Update Partylist' : 'Add Partylist'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
