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
  const [action, setAction] = useState<string>('')
  const [start, setStart] = useState<string>('')
  const [end, setEnd] = useState<string>('')

  async function loadLogs() {
    try {
      setError(null)
      const params = new URLSearchParams()
      params.set('limit', '200')
      if (action.trim()) params.set('action', action.trim())
      if (start.trim()) params.set('start', start.trim())
      if (end.trim()) params.set('end', end.trim())
      const res = await fetch(`/api/audit-logs?${params.toString()}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load audit logs')
      const data = await res.json()
      setLogs(data)
    } catch (e: any) {
      setError(e.message || 'Error')
    }
  }

  useEffect(() => {
    loadLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ padding: 16 }}>
      <h1>Audit Logs</h1>
      <form
        onSubmit={(e) => { e.preventDefault(); loadLogs() }}
        style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}
      >
        <input
          placeholder="action (vd: approve/reject)"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          style={{ padding: 8 }}
        />
        <input
          placeholder="start ISO (2025-10-16T00:00:00)"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          style={{ padding: 8 }}
        />
        <input
          placeholder="end ISO (2025-10-16T23:59:59)"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          style={{ padding: 8 }}
        />
        <button type="submit" style={{ padding: '8px 12px' }}>Filter</button>
      </form>
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


