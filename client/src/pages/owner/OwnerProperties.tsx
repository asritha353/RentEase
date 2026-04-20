import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { formatRent, formatDate, getBadgeColor } from '@/lib/utils'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, Eye } from 'lucide-react'

export default function OwnerProperties() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/properties/mine').then(r => setProperties(r.data.properties)).finally(() => setLoading(false))
  }, [])

  const del = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await api.delete(`/properties/${id}`)
      setProperties(prev => prev.filter(p => p.id !== id))
      toast.success('Property deleted')
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="page-header">My Listings</h1>
          <Link to="/owner/properties/new" className="btn-primary flex items-center gap-2 text-sm"><Plus size={16}/> Add Property</Link>
        </div>

        {loading ? <div className="skeleton h-64 rounded-2xl" /> :
         properties.length === 0 ? (
          <div className="text-center py-20 card">
            <div className="text-5xl mb-4">🏠</div>
            <p className="text-slate-700 font-bold text-lg mb-2">No listings yet</p>
            <Link to="/owner/properties/new" className="btn-primary inline-flex items-center gap-2 mt-4"><Plus size={16}/> Add First Property</Link>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Rent</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Views</th>
                  <th className="px-4 py-3">Apps</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {properties.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium text-slate-800 line-clamp-1">{p.title}</p>
                          <p className="text-xs text-slate-400">{formatDate(p.listedAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.area}, {p.city}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatRent(p.rent)}</td>
                    <td className="px-4 py-3"><span className={`badge ${getBadgeColor(p.status)}`}>{p.status.replace('_',' ')}</span></td>
                    <td className="px-4 py-3 text-slate-500">{p.viewCount}</td>
                    <td className="px-4 py-3 text-slate-500">{p._count?.applications || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/properties/${p.id}`} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors"><Eye size={15}/></Link>
                        <Link to={`/owner/properties/${p.id}/edit`} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors"><Edit2 size={15}/></Link>
                        <button onClick={() => del(p.id, p.title)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={15}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
