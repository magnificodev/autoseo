'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to dashboard
        router.push('/(dashboard)');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
            <div className="text-center">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg mx-auto mb-4">
                    <span className="text-white font-bold text-lg">A</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Autoseo</h1>
                <p className="text-muted-foreground">Redirecting to dashboard...</p>
            </div>
        </div>
    );
}
