import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { email, password, remember } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ detail: 'Email và mật khẩu là bắt buộc' }, { status: 400 });
        }

        // Forward to backend API using JSON data
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
        
        console.log('Sending to backend:', backendUrl);
        console.log('JSON data:', { email, password, remember });

        const response = await fetch(`${backendUrl}/api/auth/login-json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                remember,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { detail: errorText || 'Đăng nhập thất bại' },
                { status: response.status }
            );
        }

        // Backend returns JSON with access_token, we need to set cookie for frontend
        const data = await response.json();
        const nextResponse = NextResponse.json({ success: true, remember: Boolean(remember) });
        
        // Set cookie with the token from backend
        nextResponse.cookies.set('token', data.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: remember ? 30 * 24 * 60 * 60 : 60 * 60, // 30 days or 1 hour
            path: '/',
        });
        
        return nextResponse;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ detail: 'Lỗi server' }, { status: 500 });
    }
}
