import { router } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, RefreshCcw, UserPlus, X } from 'lucide-react';
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

function generatePassword(length = 10): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';

    let password = '';

    for (let i = 0; i < length; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return password;
}

function generateUsername(name: string): string {
    const cleanName = name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '');

    if (!cleanName) {
        return 'voter' + Math.floor(1000 + Math.random() * 9000);
    }

    return `${cleanName}${Math.floor(10 + Math.random() * 90)}`;
}

interface Errors {
    name?: string;
    username?: string;
    password?: string;
}

interface CreateVoterModalProps {
    open: boolean;
    onClose: () => void;
}

export default function CreateVoterModal({ open, onClose }: CreateVoterModalProps) {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState(() => generatePassword());
    const [showPassword, setShowPassword] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

    useEffect(() => {
        if (open) {
            setName('');
            setUsername('');
            setPassword(generatePassword());
            setShowPassword(false);
            setErrors({});
            setProcessing(false);
        }
    }, [open]);

    useEffect(() => {
        if (name.trim()) {
            setUsername(generateUsername(name));
        } else {
            setUsername('');
        }
    }, [name]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!name.trim() || !username.trim() || !password.trim() || processing) {
            return;
        }

        setProcessing(true);
        setErrors({});

        router.post(
            '/admin/voters',
            {
                name: name.trim(),
                username: username.trim(),
                password,
            },
            {
                preserveScroll: true,

                onError: (serverErrors) => {
                    setErrors({
                        name: typeof serverErrors.name === 'string' ? serverErrors.name : undefined,
                        username: typeof serverErrors.username === 'string' ? serverErrors.username : undefined,
                        password: typeof serverErrors.password === 'string' ? serverErrors.password : undefined,
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
                        <UserPlus className="h-5 w-5 text-[#2D6A4F]" />
                        Add New Voter
                    </DialogTitle>
                    <DialogDescription>Credentials are auto-generated. You can regenerate them before saving.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="voter-name">
                            Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="voter-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Juan Dela Cruz"
                            autoFocus
                            disabled={processing}
                        />
                        {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="voter-username">Username</Label>
                        <div className="flex gap-2">
                            <Input
                                id="voter-username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={processing}
                                className="font-mono"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => setUsername(generateUsername(name))}
                                disabled={processing || !name.trim()}
                            >
                                <RefreshCcw className="h-4 w-4" />
                            </Button>
                        </div>
                        {errors.username ? (
                            <p className="text-xs text-red-600">{errors.username}</p>
                        ) : (
                            <p className="text-xs text-muted-foreground">Auto-generated from the full name.</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="voter-password">Auto-Generated Password</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    id="voter-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    readOnly
                                    className="pr-10 font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    disabled={processing}
                                    className="absolute top-1/2 right-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => setPassword(generatePassword())}
                                disabled={processing}
                            >
                                <RefreshCcw className="h-4 w-4" />
                            </Button>
                        </div>
                        {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!name.trim() || !username.trim() || !password.trim() || processing}>
                            {processing ? 'Creating...' : 'Create Voter'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
