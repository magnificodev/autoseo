import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { email, password, remember } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ detail: 'Email và mật khẩu là bắt buộc' }, { status: 400 });
        }

        // Forward to backend API using form data
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
        const formData = new URLSearchParams();
        // OAuth2PasswordRequestForm compatibility
        formData.append('grant_type', 'password');
        formData.append('username', email); // Use email as username
        formData.append('password', password);
        formData.append('scope', '');
        if (remember) formData.append('remember', 'true');

        console.log('Sending to backend:', backendUrl);
        console.log('Form data:', formData.toString());

        const response = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { detail: errorText || 'Đăng nhập thất bại' },
                { status: response.status }
            );
        }

        // Get the cookie from backend response and forward it to frontend
        const setCookieHeader = response.headers.get('set-cookie');
        const nextResponse = NextResponse.json({ success: true, remember: Boolean(remember) });

        if (setCookieHeader) {
            nextResponse.headers.set('set-cookie', setCookieHeader);
        }

        return nextResponse;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ detail: 'Lỗi server' }, { status: 500 });
    }
}
