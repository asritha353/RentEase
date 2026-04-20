import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { formatRent, formatDate, getBadgeColor } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Check, X, FileText, Calendar } from 'lucide-react'

export default function OwnerApplications() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [genModal, setGenModal] = useState<any>(null)
  const [genForm, setGenForm] = useState({ startDate: '', duration: '11', specialTerms: '' })
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    api.get('/applications/received').then(r => setApplications(r.data.applications)).finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await api.patch(`/applications/${id}/status`, { status })
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a))
      toast.success(`Application ${status.toLowerCase()}`)
    } catch { toast.error('Failed') }
  }

  const generateAgreement = async () => {
    if (!genForm.startDate) { toast.error('Pick a start date'); return }
    setGenerating(true)
    try {
      await api.post(`/agreements/generate/${genModal.id}`, genForm)
      toast.success('Agreement generated!')
      setGenModal(null)
      setApplications(prev => prev.map(a => a.id === genModal.id ? { ...a, agreement: { id: 'generated' } } : a))
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Generation failed')
    }
    setGenerating(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
        <h1 className="page-header mb-6">Incoming Applications</h1>

        {loading ? <div className="skeleton h-64 rounded-2xl" /> :
         applications.length === 0 ? (
          <div className="text-center py-20 card">
            <div className="text-5xl mb-4">📬</div>
            <p className="text-slate-700 font-bold">No applications yet</p>
            <p className="text-slate-500 text-sm mt-2">Applications will appear here once tenants apply to your listings</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app.id} className="card p-5">
                <div className="flex gap-4">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${app.tenant?.name}`} alt="" className="w-12 h-12 rounded-full border border-slate-200 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{app.tenant?.name}</p>
                        <p className="text-sm text-slate-500">
                          {app.tenant?.email}
                          {app.tenantPhone && <span> · {app.tenantPhone}</span>}
                        </p>
                      </div>
                      <span className={`badge shrink-0 ${getBadgeColor(app.status)}`}>{app.status}</span>
                    </div>
                    <div className="mt-2 text-sm bg-slate-50 rounded-xl p-3">
                      <p className="font-medium text-primary text-xs mb-1">Property</p>
                      <p className="text-slate-700">{app.property?.title} — {formatRent(app.property?.rent)}/mo</p>
                      
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mb-2">
                          {app.moveInDate && <span className="flex items-center gap-1"><Calendar size={12}/> Move-in: {formatDate(app.moveInDate)}</span>}
                          {app.tenantOccupation && <span className="font-medium">Occupation: {app.tenantOccupation}</span>}
                          {app.tenantIncome && <span>Income: ₹{app.tenantIncome}/mo</span>}
                        </div>
                        {app.coverMessage && (
                          <div className="mt-2 bg-white rounded-lg p-3 text-xs text-slate-600 italic shadow-sm border border-slate-100">
                            "{app.coverMessage}"
                          </div>
                        )}
                        {app.message && !app.coverMessage && (
                          <div className="mt-2 bg-white rounded-lg p-3 text-xs text-slate-600 italic shadow-sm border border-slate-100">
                            "{app.message}"
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Applied {formatDate(app.appliedAt)}</p>
                  </div>
                </div>

                {app.status === 'PENDING' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                    <button onClick={() => updateStatus(app.id,'ACCEPTED')} className="flex items-center gap-1.5 px-4 py-2 bg-owner-50 text-owner rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors">
                      <Check size={15} /> Accept
                    </button>
                    <button onClick={() => updateStatus(app.id,'REJECTED')} className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
                      <X size={15} /> Reject
                    </button>
                  </div>
                )}

                {app.status === 'ACCEPTED' && !app.agreement && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <button onClick={() => setGenModal(app)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">
                      <FileText size={15} /> Generate Agreement
                    </button>
                  </div>
                )}
                {app.agreement && <p className="mt-3 text-xs text-owner font-medium">✓ Agreement generated</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agreement Generation Modal */}
      {genModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Generate Rental Agreement</h3>
            <p className="text-sm text-slate-500 mb-5">For: <strong>{genModal.tenant?.name}</strong> · {genModal.property?.title}</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Lease Start Date</label>
                <input type="date" value={genForm.startDate} onChange={e => setGenForm(f => ({...f, startDate: e.target.value}))} className="input" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Lease Duration</label>
                <select value={genForm.duration} onChange={e => setGenForm(f => ({...f, duration: e.target.value}))} className="input">
                  <option value="6">6 Months</option>
                  <option value="11">11 Months (Standard)</option>
                  <option value="12">1 Year</option>
                  <option value="24">2 Years</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Special Terms (optional)</label>
                <textarea value={genForm.specialTerms} onChange={e => setGenForm(f => ({...f, specialTerms: e.target.value}))} className="input resize-none h-20" placeholder="Any special conditions..." />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setGenModal(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={generateAgreement} disabled={generating} className="btn-primary flex-1 disabled:opacity-50">
                {generating ? 'Generating...' : '✨ Generate with AI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
