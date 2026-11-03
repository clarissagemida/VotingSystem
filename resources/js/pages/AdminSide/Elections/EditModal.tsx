import { router } from '@inertiajs/react';
import { CalendarDays, Save, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

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

interface Election {
    id: number;
    title: string;
    description: string | null;
    start_at: string;
    end_at: string;
    status: 'Upcoming' | 'Ongoing' | 'Completed';
}

interface Errors {
    title?: string;
    description?: string;
    start_at?: string;
    end_at?: string;
}

interface EditElectionModalProps {
    open: boolean;
    election: Election | null;
    onClose: () => void;
}

function toDateTimeLocal(value: string): string {
    if (!value) return '';
    // value may be 'YYYY-MM-DD HH:mm:ss'
    return value.replace(' ', 'T').slice(0, 16);
}

export default function EditElectionModal({ open, election, onClose }: EditElectionModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startAt, setStartAt] = useState('');
    const [endAt, setEndAt] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

    useEffect(() => {
        if (open && election) {
            setTitle(election.title || '');
            setDescription(election.description || '');
            setStartAt(toDateTimeLocal(election.start_at));
            setEndAt(toDateTimeLocal(election.end_at));
            setErrors({});
            setProcessing(false);
        }
    }, [open, election]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!election || !title.trim() || !startAt || !endAt || processing) {
            return;
        }

        setProcessing(true);
        setErrors({});

        router.patch(
            `/admin/elections/${election.id}`,
            {
                title: title.trim(),
                description: description.trim() || null,
                start_at: startAt.replace('T', ' ') + ':00',
                end_at: endAt.replace('T', ' ') + ':00',
            },
            {
                preserveScroll: true,
                onError: (serverErrors) => {
                    setErrors({
                        title: typeof serverErrors.title === 'string' ? serverErrors.title : undefined,
                        description: typeof serverErrors.description === 'string' ? serverErrors.description : undefined,
                        start_at: typeof serverErrors.start_at === 'string' ? serverErrors.start_at : undefined,
                        end_at: typeof serverErrors.end_at === 'string' ? serverErrors.end_at : undefined,
                    });
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
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-[#2D6A4F]" />
                        Edit Election
                    </DialogTitle>
                    <DialogDescription>Update election details and schedule.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-election-title">
                            Election Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="edit-election-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={processing}
                        />
                        {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-election-description">Description</Label>
                        <textarea
                            id="edit-election-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            disabled={processing}
                        />
                        {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="edit-election-start">
                                Start Date & Time <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit-election-start"
                                type="datetime-local"
                                value={startAt}
                                onChange={(e) => setStartAt(e.target.value)}
                                disabled={processing}
                            />
                            {errors.start_at && <p className="text-xs text-red-600">{errors.start_at}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-election-end">
                                End Date & Time <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit-election-end"
                                type="datetime-local"
                                value={endAt}
                                onChange={(e) => setEndAt(e.target.value)}
                                disabled={processing}
                            />
                            {errors.end_at && <p className="text-xs text-red-600">{errors.end_at}</p>}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!title.trim() || !startAt || !endAt || processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
