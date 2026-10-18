import React from 'react';

interface FormFieldProps {
    label: string;
    htmlFor?: string;
    required?: boolean;
    error?: string;
    hint?: string;
    children: React.ReactNode;
}

export default function FormField({ label, htmlFor, required = false, error, hint, children }: FormFieldProps) {
    return (
        <div className="space-y-2">
            {/* Label */}
            <label htmlFor={htmlFor} className="block text-sm font-semibold text-gray-700">
                {label}

                {required && <span className="ml-1 text-red-500">*</span>}
            </label>

            {/* Input / Select / Other field */}
            {children}

            {/* Hint */}
            {hint && !error && <p className="text-xs leading-relaxed text-gray-500">{hint}</p>}

            {/* Validation Error */}
            {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
    );
}
