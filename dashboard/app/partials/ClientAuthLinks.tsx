'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ClientAuthLinks() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false)

  useEffect(() => {
    try {
      // Check httpOnly token existence by probing a protected endpoint
      fetch('/api/sites/', { credentials: 'include' })
        .then((res) => setLoggedIn(res.status !== 401))
        .catch(() => setLoggedIn(false))
    } catch {
      setLoggedIn(false)
    }
  }, [])

  if (loggedIn) {
    return (
      <form action="/api/auth/logout" method="POST" style={{ float: 'right' }}>
        <button type="submit">Logout</button>
      </form>
    )
  }
  return (
    <Link href="/login" style={{ float: 'right' }}>Login</Link>
  )
}


