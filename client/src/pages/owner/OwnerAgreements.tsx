import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { formatRent, formatDate } from '@/lib/utils'
import { Download } from 'lucide-react'

export default function OwnerAgreements() {
  const [agreements, setAgreements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/agreements/owner').then(r => {
      setAgreements(r.data.agreements)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        <h1 className="page-header mb-6">Generated Agreements</h1>
        {loading ? <div className="skeleton h-48 rounded-2xl" /> :
         agreements.length === 0 ? (
          <div className="text-center py-20 card">
            <div className="text-5xl mb-4">📄</div>
            <p className="text-slate-700 font-bold">No agreements yet</p>
            <p className="text-slate-500 text-sm mt-2">Accept applications and generate AI-powered agreements</p>
          </div>
        ) : (
          <div className="space-y-4">
            {agreements.map((ag: any) => (
              <div key={ag.id} className="card p-5 flex items-center gap-5">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{ag.propertyAddress}</p>
                  <p className="text-sm text-slate-500">Tenant: {ag.tenantName} · {formatRent(ag.rent)}/mo</p>
                  <p className="text-xs text-slate-400 mt-1">{formatDate(ag.startDate)} → {formatDate(ag.endDate)} ({ag.duration} months)</p>
                </div>
                {ag.pdfUrl && (
                  <a href={`/api/agreements/${ag.id}/pdf`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 btn-primary text-sm py-2 shrink-0">
                    <Download size={15} /> PDF
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
