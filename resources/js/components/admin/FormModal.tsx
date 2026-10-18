import React from 'react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';

interface FormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;

    icon?: React.ComponentType<{
        className?: string;
    }>;

    title: string;
    description?: string;

    children: React.ReactNode;

    submitLabel?: string;
    submittingLabel?: string;

    processing?: boolean;

    onSubmit: React.FormEventHandler<HTMLFormElement>;
}

export default function FormModal({
    open,
    onOpenChange,
    icon: Icon,
    title,
    description,
    children,
    submitLabel = 'Save',
    submittingLabel = 'Saving...',
    processing = false,
    onSubmit,
}: FormModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-0 sm:max-w-lg">
                {/* =====================================================
                    HEADER
                ====================================================== */}

                <DialogHeader className="border-b border-gray-100 bg-gray-50 px-6 py-5 text-left">
                    <div className="flex items-start gap-4">
                        {/* Icon */}
                        {Icon && (
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                                <Icon className="h-5 w-5" />
                            </div>
                        )}

                        {/* Title + Description */}
                        <div className="min-w-0">
                            <DialogTitle className="text-lg font-bold text-gray-900">{title}</DialogTitle>

                            {description && (
                                <DialogDescription className="mt-1 text-sm leading-relaxed text-gray-500">{description}</DialogDescription>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                {/* =====================================================
                    FORM
                ====================================================== */}

                <form onSubmit={onSubmit}>
                    {/* Form Content */}
                    <div className="space-y-5 px-6 py-6">{children}</div>

                    {/* =================================================
                        FOOTER
                    ================================================== */}

                    <DialogFooter className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/50 px-6 py-4 sm:flex-row sm:justify-end">
                        {/* Cancel */}
                        <Button
                            type="button"
                            variant="outline"
                            disabled={processing}
                            onClick={() => onOpenChange(false)}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>

                        {/* Submit */}
                        <Button type="submit" disabled={processing} className="w-full bg-[#2D6A4F] hover:bg-[#1B4332] sm:w-auto">
                            {processing ? submittingLabel : submitLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
