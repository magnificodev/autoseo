import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import Providers from './providers';

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
                    <Providers>{children}</Providers>
                </ThemeProvider>
            </body>
        </html>
    );
}
