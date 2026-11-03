import { router } from '@inertiajs/react';
import { AtSign, UserCog, X } from 'lucide-react';
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

interface Voter {
    id: number;
    name: string;
    username: string | null;
}

interface EditVoterModalProps {
    open: boolean;
    voter: Voter | null;
    onClose: () => void;
}

interface ValidationErrors {
    name?: string;
    username?: string;
}

export default function EditVoterModal({ open, voter, onClose }: EditVoterModalProps) {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});

    useEffect(() => {
        if (open && voter) {
            setName(voter.name ?? '');
            setUsername(voter.username ?? '');
            setErrors({});
            setProcessing(false);
        }
    }, [open, voter]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!voter || processing) {
            return;
        }

        const trimmedName = name.trim();
        const trimmedUsername = username.trim();

        const clientErrors: ValidationErrors = {};

        if (!trimmedName) {
            clientErrors.name = 'Full name is required.';
        }

        if (!trimmedUsername) {
            clientErrors.username = 'Username is required.';
        } else if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
            clientErrors.username = 'Username may only contain letters, numbers, underscores, and hyphens.';
        }

        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        setErrors({});
        setProcessing(true);

        router.patch(
            `/admin/voters/${voter.id}`,
            {
                name: trimmedName,
                username: trimmedUsername,
            },
            {
                preserveScroll: true,

                onError: (serverErrors) => {
                    setErrors({
                        name: typeof serverErrors.name === 'string' ? serverErrors.name : undefined,
                        username: typeof serverErrors.username === 'string' ? serverErrors.username : undefined,
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
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserCog className="h-5 w-5 text-[#2D6A4F]" />
                        Edit Voter Account
                    </DialogTitle>
                    <DialogDescription>Update the voter's name and login username.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-voter-name">
                            Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="edit-voter-name"
                            value={name}
                            onChange={(event) => {
                                setName(event.target.value);
                                if (errors.name) {
                                    setErrors((prev) => ({ ...prev, name: undefined }));
                                }
                            }}
                            autoFocus
                            disabled={processing}
                        />
                        {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-voter-username">
                            Username <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <AtSign className="pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="edit-voter-username"
                                value={username}
                                onChange={(event) => {
                                    setUsername(event.target.value);
                                    if (errors.username) {
                                        setErrors((prev) => ({ ...prev, username: undefined }));
                                    }
                                }}
                                disabled={processing}
                                className="pl-8 font-mono"
                            />
                        </div>
                        {errors.username ? (
                            <p className="text-xs text-red-600">{errors.username}</p>
                        ) : (
                            <p className="text-xs text-muted-foreground">This username is used by the voter when logging in.</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || !name.trim() || !username.trim()}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
