import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ detail: 'Email và mật khẩu là bắt buộc' }, { status: 400 });
        }

        // Forward to backend API using form data
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('password', password);

        const response = await fetch(`${backendUrl}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { detail: errorText || 'Đăng ký thất bại' },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json({ message: 'Đăng ký thành công', user: result });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ detail: 'Lỗi server' }, { status: 500 });
    }
}
