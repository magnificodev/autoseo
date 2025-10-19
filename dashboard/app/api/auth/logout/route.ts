import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const response = NextResponse.json({ message: 'Logged out successfully' });

        // Clear auth cookie
        response.cookies.set('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
        });

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ detail: 'Server error' }, { status: 500 });
    }
}
