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

  async function doLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      window.location.href = '/login'
    } catch {
      window.location.href = '/login'
    }
  }

  if (loggedIn) {
    return (
      <button onClick={doLogout} style={{ float: 'right' }}>Logout</button>
    )
  }
  return (
    <Link href="/login" style={{ float: 'right' }}>Login</Link>
  )
}


