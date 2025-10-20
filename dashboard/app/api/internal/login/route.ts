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

        // Xác định danh sách backend ưu tiên (service name trước, external fallback)
        const candidateBaseUrls = [
            process.env.NEXT_PUBLIC_API_BASE || 'http://backend:8000',
            'http://40.82.144.18',
        ];

        // Prefer JSON endpoint when available; fall back to form-encoded cookie login
        // Try JSON endpoint first
        let backendResponse: Response | null = null;
        let baseUsed: string | null = null;

        for (const base of candidateBaseUrls) {
            try {
                console.log('Attempting JSON login to:', `${base}/api/auth/login-json`);
                const jsonResp = await fetch(`${base}/api/auth/login-json`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, remember: Boolean(remember) }),
                });
                console.log('JSON login response status:', jsonResp.status);
                if (jsonResp.status !== 404) {
                    backendResponse = jsonResp;
                    baseUsed = base;
                    break;
                }

                // Fallback form encoded nếu JSON endpoint không có
                console.log('JSON endpoint not found, trying form login:', `${base}/api/auth/login`);
                const formData = new URLSearchParams();
                formData.append('grant_type', 'password');
                formData.append('username', email);
                formData.append('password', password);
                formData.append('scope', '');
                if (remember) formData.append('remember', 'true');

                const formResp = await fetch(`${base}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData.toString(),
                });
                console.log('Form login response status:', formResp.status);
                backendResponse = formResp;
                baseUsed = base;
                break;
            } catch (e: any) {
                console.error(`Fetch to ${base} failed:`, e?.message || e);
                continue; // thử base tiếp theo
            }
        }

        if (!backendResponse) {
            return NextResponse.json(
                { detail: 'Không thể kết nối tới backend (cả internal và external)' },
                { status: 500 }
            );
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
            // Forward nguyên header Set-Cookie từ backend
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
        // Xác định secure theo giao thức thực tế (HTTP trên staging) hoặc biến môi trường
        const forwardedProto = request.headers.get('x-forwarded-proto');
        const isHttps = forwardedProto === 'https' || request.nextUrl.protocol === 'https:';
        const secureFlag = (process.env.COOKIE_SECURE || '').toLowerCase() === 'true' ? true : isHttps;

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: secureFlag, // tránh Secure cookie trên HTTP
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
