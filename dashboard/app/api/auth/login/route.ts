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
        formData.append('username', email);
        formData.append('password', password);
        formData.append('scope', '');
        if (remember) formData.append('remember', 'true');

        const response = await fetch(`${backendUrl}/api/auth/login-cookie`, {
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

        // Backend sets cookie, just return success
        return NextResponse.json({ success: true, remember: Boolean(remember) });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ detail: 'Lỗi server' }, { status: 500 });
    }
}
