import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { formatDate, getBadgeColor } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Search, ShieldOff, ShieldCheck } from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetch = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/users', { params: { search, role, page, limit: 20 } })
      setUsers(data.users); setTotal(data.total)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [search, role, page])

  const toggle = async (id: string, current: string, name: string) => {
    const newStatus = current === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE'
    const reason = newStatus === 'BLOCKED' ? prompt(`Reason for blocking ${name}:`) || 'Policy violation' : ''
    try {
      await api.patch(`/admin/users/${id}/status`, { status: newStatus, reason })
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u))
      toast.success(`User ${newStatus === 'BLOCKED' ? 'blocked' : 'unblocked'}`)
    } catch { toast.error('Failed') }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
        <h1 className="page-header mb-6">User Management</h1>

        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="input pl-9" placeholder="Search by name or email..." />
          </div>
          <select value={role} onChange={e => { setRole(e.target.value); setPage(1) }} className="input w-40">
            <option value="">All Roles</option>
            {['ADMIN','OWNER','TENANT'].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Properties</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_,i) => (
                  <tr key={i}>{Array(6).fill(0).map((_,j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>)}</tr>
                ))
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`} alt="" className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="font-medium text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="badge bg-slate-100 text-slate-600">{u.role}</span></td>
                  <td className="px-4 py-3"><span className={`badge ${getBadgeColor(u.status)}`}>{u.status}</span></td>
                  <td className="px-4 py-3 text-slate-500">{u._count?.properties || 0}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    {u.role !== 'ADMIN' && (
                      <button onClick={() => toggle(u.id, u.status, u.name)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                          u.status === 'ACTIVE' ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-owner-50 text-owner hover:bg-green-100'
                        }`}>
                        {u.status === 'ACTIVE' ? <><ShieldOff size={13} /> Block</> : <><ShieldCheck size={13} /> Unblock</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
          <span>{total} users total</span>
          <div className="flex gap-2">
            <button disabled={page===1} onClick={() => setPage(p => p-1)} className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100">Prev</button>
            <button disabled={users.length < 20} onClick={() => setPage(p => p+1)} className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
