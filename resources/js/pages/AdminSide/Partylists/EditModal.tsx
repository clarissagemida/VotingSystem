import { router } from '@inertiajs/react';
import { Image as ImageIcon, Save } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { PARTY_COLORS, PRIMARY, getPartylistLogoUrl, type Election, type Organization, type Partylist, type PartylistForm as PartylistFormValues } from '@/lib/partylists';

interface EditPartylistModalProps {
    open: boolean;
    onClose: () => void;
    partylist: Partylist | null;
    elections: Election[];
    organizations: Organization[];
}

export default function EditPartylistModal({ open, onClose, partylist, elections, organizations }: EditPartylistModalProps) {
    const [form, setForm] = useState<PartylistFormValues>({
        partylist_name: '',
        acronym: '',
        election_id: '',
        organization_id: '',
        color: PRIMARY,
        description: '',
        logo: null,
        banner: null,
    });
    const [preview, setPreview] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (open && partylist) {
            setForm({
                partylist_name: partylist.partylist_name ?? '',
                acronym: partylist.acronym ?? '',
                election_id: String(partylist.election_id ?? ''),
                organization_id: partylist.organization_id ? String(partylist.organization_id) : '',
                color: partylist.color ?? PRIMARY,
                description: partylist.description ?? '',
                logo: null,
                banner: null,
            });
            setPreview(getPartylistLogoUrl(partylist.logo));
            setProcessing(false);
        }
    }, [open, partylist]);

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
            Swal.fire({ icon: 'error', title: 'Invalid Image', text: 'Please select a valid image file.' });
            event.target.value = '';
            return;
        }
        if (file.size > 4 * 1024 * 1024) {
            Swal.fire({ icon: 'warning', title: 'File Too Large', text: 'Logo must not exceed 4MB.' });
            event.target.value = '';
            return;
        }
        setForm((previous) => ({ ...previous, logo: file }));
        setPreview(URL.createObjectURL(file));
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!partylist || !form.partylist_name.trim() || !form.acronym.trim() || !form.election_id || !form.organization_id || processing) {
            return;
        }
        setProcessing(true);

        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('partylist_name', form.partylist_name.trim());
        formData.append('acronym', form.acronym.trim().toUpperCase());
        formData.append('election_id', form.election_id);
        formData.append('organization_id', form.organization_id);
        formData.append('color', form.color);
        formData.append('description', form.description.trim());
        if (form.logo) formData.append('logo', form.logo);

        router.post(`/admin/partylists/${partylist.id}`, formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                if (typeof firstError === 'string') {
                    Swal.fire({ icon: 'error', title: 'Error', text: firstError });
                }
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Save className="h-5 w-5 text-[#2D6A4F]" />
                        Edit Partylist
                    </DialogTitle>
                    <DialogDescription>Update partylist details.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="epl-name">
                                Partylist Name <span className="text-red-500">*</span>
                            </Label>
                            <Input id="epl-name" name="partylist_name" value={form.partylist_name} onChange={handleChange} disabled={processing} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="epl-acr">
                                Acronym <span className="text-red-500">*</span>
                            </Label>
                            <Input id="epl-acr" name="acronym" value={form.acronym} onChange={handleChange} disabled={processing} className="uppercase" />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="epl-elec">
                                Election <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="epl-elec"
                                name="election_id"
                                value={form.election_id}
                                onChange={handleChange}
                                disabled={processing}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Select Election</option>
                                {elections?.map((election) => (
                                    <option key={election.id} value={election.id}>
                                        {election.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="epl-org">
                                Organization <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="epl-org"
                                name="organization_id"
                                value={form.organization_id}
                                onChange={handleChange}
                                disabled={processing}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Select Organization</option>
                                {organizations?.map((organization) => (
                                    <option key={organization.id} value={organization.id}>
                                        {organization.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Party Color</Label>
                        <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
                            <div className="h-9 w-9 rounded-full ring-1 ring-gray-200" style={{ backgroundColor: form.color }} />
                            {PARTY_COLORS.map((color) => (
                                <button key={color} type="button" onClick={() => handleColorChange(color)} className="h-7 w-7 rounded-full ring-1 ring-gray-200" style={{ backgroundColor: color }} disabled={processing} />
                            ))}
                            <input type="color" value={form.color} onChange={(e) => handleColorChange(e.target.value)} disabled={processing} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="epl-desc">Description</Label>
                        <textarea
                            id="epl-desc"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            disabled={processing}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Logo</Label>
                        <div className="flex items-center gap-4 rounded-lg border border-dashed p-4">
                            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg ring-1 ring-gray-200" style={{ backgroundColor: form.color }}>
                                {preview ? <img src={preview} alt="Logo preview" className="h-full w-full bg-white object-contain p-1" /> : <ImageIcon className="text-white/90" />}
                            </div>
                            <div className="flex-1">
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#1B4332] px-3 py-2 text-xs font-semibold text-white">
                                    <ImageIcon size={14} /> Change Logo
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={processing} />
                                </label>
                                <p className="mt-1 text-xs text-muted-foreground">Leave empty to keep current logo</p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!form.partylist_name.trim() || !form.acronym.trim() || !form.election_id || !form.organization_id || processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
