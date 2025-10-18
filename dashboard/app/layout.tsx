import type { Metadata } from 'next';
import './globals.css';
import ClientAuthLinks from './partials/ClientAuthLinks';
import Navigation from './partials/Navigation';
import Providers from './providers';

export const metadata: Metadata = {
    title: 'Autoseo Dashboard',
    description: 'SEO Automation Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-white text-black">
                <Providers>
                    <div className="flex min-h-screen">
                        <aside className="hidden w-56 border-r p-4 md:block">
                            <div className="mb-6 font-semibold">Autoseo</div>
                            <Navigation />
                        </aside>
                        <div className="flex-1">
                            <header className="border-b">
                                <div className="container flex h-14 items-center justify-between">
                                    <div className="font-semibold md:hidden">Autoseo</div>
                                    <ClientAuthLinks />
                                </div>
                            </header>
                            <main className="container py-6">{children}</main>
                        </div>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
