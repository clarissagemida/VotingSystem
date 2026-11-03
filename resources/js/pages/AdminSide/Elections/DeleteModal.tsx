import { router } from '@inertiajs/react';
import { AlertTriangle, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Election {
    id: number;
    title: string;
    status: 'Upcoming' | 'Ongoing' | 'Completed';
}

interface DeleteElectionModalProps {
    open: boolean;
    election: Election | null;
    onClose: () => void;
}

export default function DeleteElectionModal({ open, election, onClose }: DeleteElectionModalProps) {
    const handleDelete = () => {
        if (!election) return;
        router.delete(`/admin/elections/${election.id}`, {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    const isOngoing = election?.status === 'Ongoing';

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Election
                    </DialogTitle>
                    <DialogDescription>
                        {isOngoing
                            ? 'This election is currently ongoing and cannot be deleted.'
                            : 'This action cannot be undone. The election and related data will be removed.'}
                    </DialogDescription>
                </DialogHeader>

                {election && !isOngoing && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        You are about to delete <span className="font-semibold">{election.title}</span>.
                    </div>
                )}

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    {!isOngoing && (
                        <Button type="button" variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
