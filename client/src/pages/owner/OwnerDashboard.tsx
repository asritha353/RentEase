import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { formatRent } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { Plus, Home, FileText, TrendingUp, ArrowRight, Eye } from 'lucide-react'

export default function OwnerDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ listings: 0, pending: 0, active: 0, views: 0 })
  const [properties, setProperties] = useState<any[]>([])

  useEffect(() => {
    api.get('/properties/mine').then(r => {
      const props = r.data.properties
      setProperties(props.slice(0, 4))
      setStats({
        listings: props.length,
        pending:  props.reduce((s: number, p: any) => s + (p._count?.applications || 0), 0),
        active:   props.filter((p: any) => p.status === 'AVAILABLE').length,
        views:    props.reduce((s: number, p: any) => s + (p.viewCount || 0), 0),
      })
    }).catch(() => {})
  }, [])

  const cards = [
    { icon: Home,      label: 'Total Listings',     value: stats.listings, to: '/owner/properties', color: 'bg-owner-50 text-owner' },
    { icon: FileText,  label: 'Pending Applications',value: stats.pending, to: '/owner/applications', color: 'bg-amber-50 text-amber-600' },
    { icon: TrendingUp,label: 'Active Listings',     value: stats.active,  to: '/owner/properties', color: 'bg-primary-50 text-primary' },
    { icon: Eye,       label: 'Total Views',         value: stats.views,   to: '/owner/properties', color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="page-header">Owner Dashboard</h1>
            <p className="text-slate-500">Welcome back, {user?.name.split(' ')[0]}</p>
          </div>
          <Link to="/owner/properties/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Property
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {cards.map(c => (
            <Link key={c.label} to={c.to} className="card p-5 hover:shadow-md transition-all group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color}`}><c.icon size={20} /></div>
              <div className="text-2xl font-bold text-slate-900">{c.value}</div>
              <div className="text-sm text-slate-500 mt-0.5">{c.label}</div>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Recent Listings</h2>
          <Link to="/owner/properties" className="text-sm text-primary hover:underline flex items-center gap-1">View all <ArrowRight size={14} /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {properties.map(p => (
            <div key={p.id} className="card p-4 flex gap-4">
              <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200'} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{p.title}</p>
                <p className="text-xs text-slate-500">{p.city} · {formatRent(p.rent)}/mo</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  <span><Eye size={11} className="inline" /> {p.viewCount}</span>
                  <span>📋 {p._count?.applications || 0} apps</span>
                </div>
              </div>
              <Link to={`/owner/properties/${p.id}/edit`} className="text-xs text-primary hover:underline self-start">Edit</Link>
            </div>
          ))}
        </div>

        {properties.length === 0 && (
          <div className="text-center py-16 card">
            <div className="text-5xl mb-4">🏠</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No listings yet</h3>
            <p className="text-slate-500 mb-6">Add your first property to start receiving applications</p>
            <Link to="/owner/properties/new" className="btn-primary inline-flex items-center gap-2"><Plus size={16}/> Add First Property</Link>
          </div>
        )}
      </div>
    </div>
  )
}
