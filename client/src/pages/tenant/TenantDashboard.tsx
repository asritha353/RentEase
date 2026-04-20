import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { formatRent } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { Home, Search, FileText, Heart, ArrowRight } from 'lucide-react'

export default function TenantDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ applications: 0, saved: 0, agreements: 0 })
  const [recent, setRecent] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      api.get('/applications/mine'),
      api.get('/saved'),
    ]).then(([apps, saved]) => {
      const agreements = apps.data.applications.filter((a: any) => a.agreement).length
      setStats({ applications: apps.data.applications.length, saved: saved.data.saved.length, agreements })
    }).catch(() => {})

    api.get('/properties', { params: { limit: 4, sort: 'newest' } })
      .then(r => setRecent(r.data.properties)).catch(() => {})
  }, [])

  const cards = [
    { icon: FileText, label: 'My Applications', value: stats.applications, to: '/tenant/applications', color: 'bg-primary-50 text-primary' },
    { icon: Heart,    label: 'Saved Properties',value: stats.saved,        to: '/tenant/saved',        color: 'bg-red-50 text-red-500' },
    { icon: FileText, label: 'Agreements',       value: stats.agreements,   to: '/tenant/agreements',  color: 'bg-owner-50 text-owner' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="page-header">Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="text-slate-500">Find your perfect home in India's top cities</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {cards.map(c => (
            <Link key={c.label} to={c.to} className="card p-5 hover:shadow-md transition-all group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color}`}>
                <c.icon size={20} />
              </div>
              <div className="text-2xl font-bold text-slate-900">{c.value}</div>
              <div className="text-sm text-slate-500 mt-0.5">{c.label}</div>
              <div className="flex items-center gap-1 text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">View <ArrowRight size={12} /></div>
            </Link>
          ))}
        </div>

        {/* Quick Search */}
        <div className="card p-6 mb-8 bg-gradient-to-r from-tenant to-orange-400 text-white">
          <h2 className="font-bold text-lg mb-1">Ready to find your next home?</h2>
          <p className="text-orange-100 text-sm mb-4">Browse 100+ verified listings across 5 cities</p>
          <Link to="/tenant/search" className="inline-flex items-center gap-2 bg-white text-tenant font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-orange-50 transition-colors">
            <Search size={16} /> Search Properties
          </Link>
        </div>

        {/* Recent listings */}
        <h2 className="section-title">Recently Added</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recent.map(p => (
            <Link key={p.id} to={`/properties/${p.id}`} className="card p-3 hover:shadow-md transition-all group">
              <div className="h-28 rounded-xl overflow-hidden mb-2">
                <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <p className="text-xs font-semibold text-slate-800 line-clamp-1">{p.title}</p>
              <p className="text-xs text-slate-500">{p.city}</p>
              <p className="text-sm font-bold text-primary mt-1">{formatRent(p.rent)}/mo</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
