import { router } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Voter {
    id: number;
    name: string;
}

interface DeleteVoterModalProps {
    open: boolean;
    voter: Voter | null;
    onClose: () => void;
}

export default function DeleteVoterModal({ open, voter, onClose }: DeleteVoterModalProps) {
    const [processing, setProcessing] = useState(false);

    if (!voter) {
        return null;
    }

    const handleDelete = () => {
        setProcessing(true);

        router.delete(`/admin/voters/${voter.id}`, {
            preserveScroll: true,

            onFinish: () => {
                setProcessing(false);
            },

            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(value) => !value && !processing && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center sm:text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <DialogTitle className="text-xl">Delete voter?</DialogTitle>
                    <DialogDescription className="text-base">
                        <strong className="text-foreground">{voter.name}</strong> will be permanently removed. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="sm:justify-center">
                    <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                        Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={processing}>
                        {processing ? 'Deleting...' : 'Yes, delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
