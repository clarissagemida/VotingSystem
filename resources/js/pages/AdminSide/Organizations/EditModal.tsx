import { router } from '@inertiajs/react';
import { Building2, ListOrdered } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

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

interface Organization {
    id: number;
    name: string;
    type: 'SSG' | 'FLP' | 'OTHER';
}

interface EditOrganizationModalProps {
    open: boolean;
    organization: Organization | null;
    onClose: () => void;
}

const POSITION_SETS: Record<'SSG' | 'FLP' | 'OTHER', string[]> = {
    SSG: [
        'President',
        'Vice President',
        'Senator 1',
        'Senator 2',
        'Senator 3',
        'Senator 4',
        'Senator 5',
        'Senator 6',
        'Senator 7',
        'Senator 8',
        'Senator 9',
        'Senator 10',
    ],
    FLP: [
        'President',
        'Vice President',
        'Secretary',
        'General Secretary',
        'Treasurer',
        'Auditor',
        'Business Manager',
        'Public Relation Officer',
        'Speaker of the House',
        'Deputy Speaker of the House',
        'Sentinel',
        'Muse',
    ],
    OTHER: ['President', 'Vice President', 'Secretary', 'Treasurer', 'Auditor', 'Business Manager', 'PIO', 'Sergeant at Arms', 'Muse', 'Escort'],
};

export default function EditOrganizationModal({ open, organization, onClose }: EditOrganizationModalProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState<'SSG' | 'FLP' | 'OTHER'>('OTHER');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const positions = useMemo(() => POSITION_SETS[type] ?? [], [type]);

    useEffect(() => {
        if (open && organization) {
            setName(organization.name ?? '');
            setType(organization.type);
            setErrors({});
            setProcessing(false);
        }
    }, [open, organization]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!organization) return;
        setProcessing(true);
        setErrors({});

        router.patch(
            `/admin/organizations/${organization.id}`,
            {
                name: type === 'OTHER' ? name.trim() : null,
                type,
            },
            {
                preserveScroll: true,
                onError: (serverErrors) => {
                    const mapped: Record<string, string> = {};
                    for (const [key, value] of Object.entries(serverErrors)) {
                        if (typeof value === 'string') {
                            mapped[key] = value;
                        }
                    }
                    setErrors(mapped);
                },
                onSuccess: () => {
                    onClose();
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-[#2D6A4F]" />
                        Edit Organization
                    </DialogTitle>
                    <DialogDescription>Update organization details.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-org-type">Organization Type</Label>
                        <select
                            id="edit-org-type"
                            value={type}
                            onChange={(e) => setType(e.target.value as 'SSG' | 'FLP' | 'OTHER')}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="SSG">SSG (Supreme Student Government)</option>
                            <option value="FLP">FLP (Future Leader of the Philippines)</option>
                            <option value="OTHER">Other</option>
                        </select>
                        {errors.type && <p className="text-xs text-red-600">{errors.type}</p>}
                    </div>

                    {type === 'OTHER' && (
                        <div className="space-y-2">
                            <Label htmlFor="edit-org-name">
                                Organization Name <span className="text-red-500">*</span>
                            </Label>
                            <Input id="edit-org-name" value={name} onChange={(e) => setName(e.target.value)} disabled={processing} />
                            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                        </div>
                    )}

                    <div className="rounded-lg border bg-muted/30 p-3">
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                            <ListOrdered className="h-4 w-4 text-[#2D6A4F]" />
                            Position Set ({positions.length})
                        </div>
                        <div className="grid grid-cols-1 gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                            {positions.map((pos) => (
                                <div key={pos} className="rounded-md bg-background px-2 py-1">
                                    {pos}
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || (type === 'OTHER' && !name.trim())}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
