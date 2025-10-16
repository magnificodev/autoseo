import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
    title: 'Autoseo Dashboard',
    description: 'SEO Automation Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <nav style={{ padding: 12, borderBottom: '1px solid #ddd', marginBottom: 16 }}>
                    <Link href="/sites" style={{ marginRight: 12 }}>Sites</Link>
                    <Link href="/content" style={{ marginRight: 12 }}>Content</Link>
                    <Link href="/admins" style={{ marginRight: 12 }}>Admins</Link>
                    <Link href="/audit-logs" style={{ marginRight: 12 }}>Audit Logs</Link>
                    <Link href="/login" style={{ float: 'right' }}>Login</Link>
                </nav>
                {children}
            </body>
        </html>
    );
}
