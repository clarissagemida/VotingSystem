import Header from '@/components/voter/Header';
import Sidebar from '@/components/voter/Sidebar';
import { ReactNode } from 'react';

interface VoterLayoutProps {
    children: ReactNode;
}

export default function VoterLayout({ children }: VoterLayoutProps) {
    return (
        <div className="flex h-screen overflow-hidden bg-[#F8FAF9]">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Area */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Header */}
                <Header />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-[#F8FAF9] to-green-50/30">
                    <div className="mx-auto w-full max-w-[1400px] p-6 lg:p-8">{children}</div>
                </main>
            </div>
        </div>
    );
}
