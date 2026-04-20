import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { formatRent, formatDate } from '@/lib/utils'
import { Download, FileText } from 'lucide-react'

export default function TenantAgreements() {
  const [agreements, setAgreements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/agreements/my').then(r => {
      setAgreements(r.data.agreements)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        <h1 className="page-header mb-6">My Agreements</h1>
        {loading ? <div className="skeleton h-48 rounded-2xl" /> :
         agreements.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No agreements yet</h3>
            <p className="text-slate-500">Agreements appear here once your application is accepted and the owner generates one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {agreements.map((ag: any) => (
              <div key={ag.id} className="card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={18} className="text-owner" />
                      <h3 className="font-semibold text-slate-900">{ag.propertyAddress}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-slate-500 mt-2">
                      <span>Owner: <strong className="text-slate-700">{ag.ownerName}</strong></span>
                      <span>Rent: <strong className="text-slate-700">{formatRent(ag.rent)}/mo</strong></span>
                      <span>Start: <strong className="text-slate-700">{formatDate(ag.startDate)}</strong></span>
                      <span>Duration: <strong className="text-slate-700">{ag.duration} months</strong></span>
                      <span>Deposit: <strong className="text-slate-700">{formatRent(ag.deposit)}</strong></span>
                      <span>End: <strong className="text-slate-700">{formatDate(ag.endDate)}</strong></span>
                    </div>
                  </div>
                  {ag.pdfUrl && (
                    <a href={`/api/agreements/${ag.id}/pdf`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 btn-primary text-sm py-2 shrink-0">
                      <Download size={15} /> Download PDF
                    </a>
                  )}
                </div>
                {ag.terms && (
                  <details className="mt-4">
                    <summary className="text-xs text-primary cursor-pointer hover:underline">View Full Agreement Text</summary>
                    <pre className="mt-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl whitespace-pre-wrap font-mono max-h-60 overflow-y-auto">{ag.terms}</pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
