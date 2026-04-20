import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { formatRent, formatDate, getBadgeColor } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'

export default function AdminProperties() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const fetch = async () => {
    setLoading(true)
    const { data } = await api.get('/admin/properties', { params: { page, limit: 20 } })
    setProperties(data.properties); setTotal(data.total)
    setLoading(false)
  }

  useEffect(() => { fetch() }, [page])

  const del = async (id: string, title: string) => {
    if (!confirm(`Admin delete: "${title}"?`)) return
    try {
      await api.delete(`/admin/properties/${id}`)
      setProperties(prev => prev.filter(p => p.id !== id))
      toast.success('Property removed')
    } catch { toast.error('Failed') }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
        <h1 className="page-header mb-6">All Properties ({total})</h1>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-4 py-3">Property</th><th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Rent</th><th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Apps</th><th className="px-4 py-3">Listed</th>
                <th className="px-4 py-3">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? Array(5).fill(0).map((_,i) => (
                <tr key={i}>{Array(7).fill(0).map((_,j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>)}</tr>
              )) : properties.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">{p.title}</td>
                  <td className="px-4 py-3 text-slate-500">{p.owner?.name}</td>
                  <td className="px-4 py-3 font-semibold">{formatRent(p.rent)}</td>
                  <td className="px-4 py-3"><span className={`badge ${getBadgeColor(p.status)}`}>{p.status}</span></td>
                  <td className="px-4 py-3 text-slate-500">{p._count?.applications || 0}</td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(p.listedAt)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => del(p.id, p.title)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 size={15}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2 mt-4 justify-end">
          <button disabled={page===1} onClick={() => setPage(p => p-1)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-100">Prev</button>
          <button disabled={properties.length < 20} onClick={() => setPage(p => p+1)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-100">Next</button>
        </div>
      </div>
    </div>
  )
}
