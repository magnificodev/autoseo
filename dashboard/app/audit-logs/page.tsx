'use client'

import React, { useEffect, useState } from 'react'

type AuditLog = {
  id: number
  actor_user_id: number
  action: string
  target_type: string
  target_id: number
  note?: string | null
  created_at?: string | null
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [error, setError] = useState<string | null>(null)

  async function loadLogs() {
    try {
      setError(null)
      const res = await fetch('/api/audit-logs?limit=200', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load audit logs')
      const data = await res.json()
      setLogs(data)
    } catch (e: any) {
      setError(e.message || 'Error')
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  return (
    <div style={{ padding: 16 }}>
      <h1>Audit Logs</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>ID</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actor</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Action</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Target</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Note</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id}>
              <td style={{ padding: '6px 8px' }}>{l.id}</td>
              <td style={{ padding: '6px 8px' }}>{l.actor_user_id}</td>
              <td style={{ padding: '6px 8px' }}>{l.action}</td>
              <td style={{ padding: '6px 8px' }}>{l.target_type}#{l.target_id}</td>
              <td style={{ padding: '6px 8px' }}>{l.note || ''}</td>
              <td style={{ padding: '6px 8px' }}>{l.created_at || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


