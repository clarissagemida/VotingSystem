import Header from '@/components/admin/Header';
import Sidebar from '@/components/admin/Sidebar';
import { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { props } = usePage<{ flash?: { adminAlert?: { title: string; message: string; type: 'success' | 'error' } } }>();

    useEffect(() => {
        const alert = props.flash?.adminAlert;
        if (alert) {
            void Swal.fire({ icon: alert.type, title: alert.title, text: alert.message, confirmButtonColor: '#2D6A4F' });
        }
    }, [props.flash?.adminAlert]);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Area */}
            <div className="flex flex-1 flex-col">
                {/* Header */}
                <Header />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
