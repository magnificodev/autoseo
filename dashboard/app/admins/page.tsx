'use client'

import React, { useEffect, useState } from 'react'

type Admin = { user_id: number }

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchAdmins() {
    try {
      setError(null)
      const res = await fetch('/api/admins', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load admins')
      const data = await res.json()
      setAdmins(data)
    } catch (e: any) {
      setError(e.message || 'Error')
    }
  }

  async function addAdmin(e: React.FormEvent) {
    e.preventDefault()
    if (!userId.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: Number(userId) })
      })
      if (!res.ok) throw new Error('Failed to add admin')
      setUserId('')
      await fetchAdmins()
    } catch (e: any) {
      setError(e.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  async function removeAdmin(id: number) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admins/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to remove admin')
      await fetchAdmins()
    } catch (e: any) {
      setError(e.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  return (
    <div style={{ padding: 16 }}>
      <h1>Telegram Admins</h1>
      <form onSubmit={addAdmin} style={{ marginTop: 12, marginBottom: 12 }}>
        <input
          type="number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID"
          style={{ padding: 8, marginRight: 8 }}
        />
        <button type="submit" disabled={loading} style={{ padding: '8px 12px' }}>
          Add
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {admins.map((a) => (
          <li key={a.user_id} style={{ marginBottom: 6 }}>
            <span style={{ marginRight: 8 }}>{a.user_id}</span>
            <button onClick={() => removeAdmin(a.user_id)} disabled={loading}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
