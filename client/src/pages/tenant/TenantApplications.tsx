import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { formatRent, formatDate, getBadgeColor } from '@/lib/utils'
import StatusTimeline from '@/components/application/StatusTimeline'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FileText } from 'lucide-react'

export default function TenantApplications() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/applications/mine')
      .then(r => setApplications(r.data.applications))
      .finally(() => setLoading(false))
  }, [])

  const withdraw = async (id: string) => {
    if (!confirm('Withdraw this application?')) return
    try {
      await api.delete(`/applications/${id}`)
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'WITHDRAWN' } : a))
      toast.success('Application withdrawn')
    } catch { toast.error('Failed to withdraw') }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        <h1 className="page-header mb-6">My Applications</h1>

        {loading ? (
          <div className="space-y-4">{Array(3).fill(0).map((_,i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No applications yet</h3>
            <p className="text-slate-500 mb-6">Browse properties and apply to ones you like</p>
            <Link to="/tenant/search" className="btn-primary">Browse Properties</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app.id} className="card p-5">
                <div className="flex gap-4">
                  <img src={app.property?.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200'} alt=""
                    className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Link to={`/properties/${app.propertyId}`} className="font-semibold text-slate-900 hover:text-primary truncate">{app.property?.title}</Link>
                      <span className={`badge shrink-0 ${getBadgeColor(app.status)}`}>{app.status}</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">{app.property?.city} · {formatRent(app.property?.rent)}/mo</p>
                    <StatusTimeline status={app.status} appliedAt={app.appliedAt} updatedAt={app.updatedAt} hasAgreement={!!app.agreement} />
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400">Applied {formatDate(app.appliedAt)}</span>
                  <div className="flex-1" />
                  {app.agreement && (
                    <Link to="/tenant/agreements" className="flex items-center gap-1 text-xs text-owner font-medium hover:underline">
                      <FileText size={13} /> View Agreement
                    </Link>
                  )}
                  {app.status === 'PENDING' && (
                    <button onClick={() => withdraw(app.id)} className="text-xs text-red-500 hover:underline">Withdraw</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
