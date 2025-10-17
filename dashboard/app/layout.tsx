import type { Metadata } from 'next';
import './globals.css';
import ClientAuthLinks from './partials/ClientAuthLinks';

export const metadata: Metadata = {
    title: 'Autoseo Dashboard',
    description: 'SEO Automation Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-white text-black">
                <header className="border-b">
                    <div className="container flex h-14 items-center justify-between">
                        <div className="font-semibold">Autoseo Dashboard</div>
                        <ClientAuthLinks />
                    </div>
                </header>
                <main className="container py-6">
                    {children}
                </main>
            </body>
        </html>
    );
}
