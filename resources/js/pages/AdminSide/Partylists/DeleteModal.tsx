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

interface Partylist {
    id: number;
    partylist_name: string;
}

interface DeletePartylistModalProps {
    open: boolean;
    partylist: Partylist | null;
    onClose: () => void;
}

export default function DeletePartylistModal({ open, partylist, onClose }: DeletePartylistModalProps) {
    const handleDelete = () => {
        if (!partylist) return;
        router.delete(`/admin/partylists/${partylist.id}`, {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Partylist
                    </DialogTitle>
                    <DialogDescription>This action cannot be undone. Related candidate records may be affected.</DialogDescription>
                </DialogHeader>

                {partylist && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        You are about to delete <span className="font-semibold">{partylist.partylist_name}</span>.
                    </div>
                )}

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
