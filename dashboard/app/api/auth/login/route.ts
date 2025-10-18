import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { detail: 'Email và mật khẩu là bắt buộc' },
                { status: 400 }
            );
        }

        // Forward to backend API
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
        const response = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { detail: errorData.detail || 'Đăng nhập thất bại' },
                { status: response.status }
            );
        }

        const data = await response.json();
        
        // Set httpOnly cookie
        const cookieResponse = NextResponse.json(data);
        cookieResponse.cookies.set('auth_token', data.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return cookieResponse;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { detail: 'Lỗi server' },
            { status: 500 }
        );
    }
}
