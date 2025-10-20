import { NextRequest, NextResponse } from 'next/server';

// New consolidated login handler that always accepts JSON from the web app
// and ensures a proper auth cookie is set for the browser regardless of how
// the backend chooses to respond (JSON token or Set-Cookie header).
export async function POST(request: NextRequest) {
    try {
        const { email, password, remember } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { detail: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Try different backend URLs to test connectivity
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

        console.log('Backend URL:', backendUrl);
        console.log('Environment check:', {
            INTERNAL_API_BASE: process.env.INTERNAL_API_BASE,
            NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
            NODE_ENV: process.env.NODE_ENV,
        });

        // Prefer JSON endpoint when available; fall back to form-encoded cookie login
        // Try JSON endpoint first
        console.log('Attempting JSON login to:', `${backendUrl}/api/auth/login-json`);
        let backendResponse;
        try {
            backendResponse = await fetch(`${backendUrl}/api/auth/login-json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, remember: Boolean(remember) }),
            });
            console.log('JSON login response status:', backendResponse.status);
        } catch (fetchError: any) {
            console.error('JSON login fetch error:', fetchError.message);
            return NextResponse.json({ detail: `Backend connection failed: ${fetchError.message}` }, { status: 500 });
        }

        // If JSON endpoint not found, fallback to cookie endpoint (form-encoded)
        if (backendResponse.status === 404) {
            console.log(
                'JSON endpoint not found, trying form-encoded login to:',
                `${backendUrl}/api/auth/login`
            );
            const formData = new URLSearchParams();
            formData.append('grant_type', 'password');
            formData.append('username', email);
            formData.append('password', password);
            formData.append('scope', '');
            if (remember) formData.append('remember', 'true');

            backendResponse = await fetch(`${backendUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString(),
            });
            console.log('Form login response status:', backendResponse.status);
        }

        if (!backendResponse.ok) {
            const errorText = await backendResponse.text();
            return NextResponse.json(
                { detail: errorText || 'Login failed' },
                { status: backendResponse.status }
            );
        }

        // If backend returned Set-Cookie, forward it as-is
        const setCookieHeader = backendResponse.headers.get('set-cookie');
        if (setCookieHeader) {
            const res = NextResponse.json({ success: true, remember: Boolean(remember) });
            res.headers.set('set-cookie', setCookieHeader);
            return res;
        }

        // Otherwise expect a JSON token and set cookie ourselves
        let token: string | undefined;
        try {
            const data = await backendResponse.json();
            token = data?.access_token;
        } catch (_) {
            // ignore json parse error; will handle as generic failure next
        }

        if (!token) {
            return NextResponse.json({ detail: 'Login failed' }, { status: 500 });
        }

        const response = NextResponse.json({ success: true, remember: Boolean(remember) });
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: remember ? 30 * 24 * 60 * 60 : 60 * 60, // 30 days or 1 hour
            path: '/',
        });
        return response;
    } catch (error: any) {
        console.error('Login error:', error?.message || error);
        return NextResponse.json({ detail: error?.message || 'Server error' }, { status: 500 });
    }
}
