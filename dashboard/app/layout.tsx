import type { Metadata } from 'next';
import './globals.css';
import ClientAuthLinks from './partials/ClientAuthLinks';
import Navigation from './partials/Navigation';
import Providers from './providers';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
    title: 'Autoseo Dashboard',
    description: 'SEO Automation Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="h-full" suppressHydrationWarning>
            <body className="h-full bg-background text-foreground font-sans antialiased">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Providers>
                        <div className="flex h-screen overflow-hidden">
                            {/* Sidebar */}
                            <aside className="hidden w-64 border-r bg-card/50 backdrop-blur-sm md:flex md:flex-col">
                                <div className="flex h-16 items-center border-b px-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                                            <span className="text-white font-bold text-sm">
                                                A
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-xl font-bold text-foreground">Autoseo</span>
                                            <p className="text-xs text-muted-foreground">SEO Automation</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4">
                                    <Navigation />
                                </div>
                            </aside>

                            {/* Main Content */}
                            <div className="flex flex-1 flex-col overflow-hidden">
                                {/* Header */}
                                <header className="border-b bg-card/50 backdrop-blur-sm">
                                    <div className="flex h-16 items-center justify-between px-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="md:hidden">
                                                <div className="flex items-center space-x-2">
                                                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                                                        <span className="text-primary-foreground font-bold text-sm">
                                                            A
                                                        </span>
                                                    </div>
                                                    <span className="text-xl font-bold text-foreground">
                                                        Autoseo
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <ClientAuthLinks />
                                    </div>
                                </header>

                                {/* Main Content Area */}
                                <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background to-muted/20">
                                    <div className="container mx-auto p-6 max-w-7xl">{children}</div>
                                </main>
                            </div>
                        </div>
                    </Providers>
                </ThemeProvider>
            </body>
        </html>
    );
}