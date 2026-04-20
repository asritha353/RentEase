import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { formatDate, getBadgeColor } from '@/lib/utils'

export default function AdminApplications() {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    api.get('/admin/applications', { params: { page, limit: 20 } })
      .then(r => setApps(r.data.applications)).finally(() => setLoading(false))
  }, [page])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
        <h1 className="page-header mb-6">All Applications</h1>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase">
                <th className="px-4 py-3">Tenant</th><th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Owner</th><th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? Array(5).fill(0).map((_,i) => (
                <tr key={i}>{Array(5).fill(0).map((_,j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>)}</tr>
              )) : apps.map(a => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3"><p className="font-medium">{a.tenant?.name}</p><p className="text-xs text-slate-400">{a.tenant?.email}</p></td>
                  <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{a.property?.title}</td>
                  <td className="px-4 py-3 text-slate-500">{a.property?.owner?.name}</td>
                  <td className="px-4 py-3"><span className={`badge ${getBadgeColor(a.status)}`}>{a.status}</span></td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(a.appliedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2 mt-4 justify-end">
          <button disabled={page===1} onClick={() => setPage(p => p-1)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-100">Prev</button>
          <button disabled={apps.length < 20} onClick={() => setPage(p => p+1)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-100">Next</button>
        </div>
      </div>
    </div>
  )
}
