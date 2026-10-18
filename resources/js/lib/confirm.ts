import Swal from 'sweetalert2';

interface ConfirmDeleteOptions {
    title?: string;
    itemName?: string;
    subtitle?: string;
    confirmButtonText?: string;
}

function escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

/**
 * Show a standard "delete this item?" confirmation dialog.
 * Returns true when the user confirms the deletion.
 */
export async function confirmDelete({
    title = 'Delete Item?',
    itemName,
    subtitle = 'This action cannot be undone.',
    confirmButtonText = 'Yes, Delete',
}: ConfirmDeleteOptions = {}): Promise<boolean> {
    const result = await Swal.fire({
        title,
        html: `
            <div style="text-align:center">
                ${
                    itemName
                        ? `<p style="margin-bottom:8px">You are about to delete:</p>
                           <strong style="font-size:18px">${escapeHtml(itemName)}</strong>`
                        : ''
                }
                <p style="margin-top:12px;color:#6b7280">${subtitle}</p>
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        reverseButtons: true,
    });

    return result.isConfirmed;
}
