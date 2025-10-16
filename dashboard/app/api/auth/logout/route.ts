import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  // Clear httpOnly cookie named 'token'
  res.cookies.set('token', '', { path: '/', httpOnly: true, secure: true, sameSite: 'lax', maxAge: 0 })
  return res
}


