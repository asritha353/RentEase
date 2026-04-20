import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'

const actionColor: Record<string, string> = {
  LOGIN: 'bg-blue-50 text-blue-600', LOGOUT: 'bg-slate-100 text-slate-500',
  PROPERTY_CREATED: 'bg-owner-50 text-owner', PROPERTY_DELETED: 'bg-red-50 text-red-500',
  APPLICATION_SUBMITTED: 'bg-amber-50 text-amber-600',
  APPLICATION_ACCEPTED: 'bg-owner-50 text-owner', APPLICATION_REJECTED: 'bg-red-50 text-red-500',
  AGREEMENT_GENERATED: 'bg-purple-50 text-purple-600',
  USER_BLOCKED: 'bg-red-50 text-red-500', USER_ACTIVE: 'bg-owner-50 text-owner',
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setLoading(true)
    api.get('/admin/logs', { params: { page, limit: 50 } })
      .then(r => { setLogs(r.data.logs); setTotal(r.data.total) }).finally(() => setLoading(false))
  }, [page])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
        <h1 className="page-header mb-6">Audit Log ({total} entries)</h1>
        <div className="space-y-2">
          {loading ? Array(10).fill(0).map((_,i) => <div key={i} className="skeleton h-14 rounded-xl" />) :
           logs.map(log => (
            <div key={log.id} className="card px-4 py-3 flex items-center gap-3">
              <span className={`badge text-xs shrink-0 ${actionColor[log.action] || 'bg-slate-100 text-slate-600'}`}>{log.action}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 truncate">
                  <span className="font-medium">{log.user?.name || 'System'}</span>
                  {log.entity && <span className="text-slate-400"> · {log.entity}</span>}
                  {log.metadata?.reason && <span className="text-slate-400"> · {log.metadata.reason}</span>}
                </p>
                <p className="text-xs text-slate-400">{log.user?.email}</p>
              </div>
              <span className="text-xs text-slate-400 shrink-0">{formatDate(log.timestamp)}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-6 justify-end">
          <button disabled={page===1} onClick={() => setPage(p => p-1)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-100">Newer</button>
          <button disabled={logs.length < 50} onClick={() => setPage(p => p+1)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-100">Older</button>
        </div>
      </div>
    </div>
  )
}
