import { router } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface Voter {
    id: number;
    name: string;
}

interface DeleteProps {
    open: boolean;
    voter: Voter | null;
    onClose: () => void;
}

export default function Delete({ open, voter, onClose }: DeleteProps) {
    const [processing, setProcessing] = useState(false);

    if (!open || !voter) return null;

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
            <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">
                <div className="px-8 pt-8 pb-6 text-center">
                    {/* ICON */}
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-orange-100 bg-orange-50">
                        <AlertTriangle className="h-12 w-12 text-orange-400" />
                    </div>

                    <h2 className="text-3xl font-bold text-gray-700">Delete voter?</h2>

                    <p className="mx-auto mt-5 max-w-md text-base leading-7 text-gray-500">
                        <strong className="text-gray-700">{voter.name}</strong> will be permanently removed. This action cannot be undone.
                    </p>
                </div>

                <div className="flex items-center justify-center gap-3 border-t border-gray-100 px-7 py-6">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={processing}
                        className="h-11 rounded-lg bg-red-500 px-7 text-sm font-semibold text-white shadow-md transition hover:bg-red-600 disabled:opacity-50"
                    >
                        {processing ? 'Deleting...' : 'Yes, delete'}
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="h-11 rounded-lg bg-gray-500 px-7 text-sm font-semibold text-white transition hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export { Delete as DeleteVoter };
