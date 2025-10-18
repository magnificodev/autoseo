import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const response = NextResponse.json({ message: 'Đăng xuất thành công' });
        
        // Clear auth cookie
        response.cookies.set('auth_token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
        });

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { detail: 'Lỗi server' },
            { status: 500 }
        );
    }
}