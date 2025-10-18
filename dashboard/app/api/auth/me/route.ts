import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json(
                { detail: 'Không có token' },
                { status: 401 }
            );
        }

        // Forward to backend API
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
        const response = await fetch(`${backendUrl}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { detail: 'Token không hợp lệ' },
                { status: 401 }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json(
            { detail: 'Lỗi server' },
            { status: 500 }
        );
    }
}
