import { CheckCircle2, Clock, XCircle, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Props { status: string; appliedAt: string; updatedAt: string; hasAgreement?: boolean }

const steps = [
  { key: 'PENDING',  label: 'Applied',      icon: Clock },
  { key: 'REVIEW',   label: 'Under Review',  icon: Clock },
  { key: 'ACCEPTED', label: 'Decision',      icon: CheckCircle2 },
  { key: 'AGREEMENT',label: 'Agreement',     icon: FileText },
]

export default function StatusTimeline({ status, appliedAt, updatedAt, hasAgreement }: Props) {
  const activeIdx =
    status === 'PENDING'   ? 1
    : status === 'ACCEPTED' ? (hasAgreement ? 3 : 2)
    : status === 'REJECTED' ? 2
    : 1

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const Icon = step.icon
        const done = i < activeIdx
        const current = i === activeIdx - 1
        const rejected = status === 'REJECTED' && i === 2

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                rejected ? 'bg-red-100 text-red-500'
                : done || current ? 'bg-owner text-white'
                : 'bg-slate-100 text-slate-400'
              }`}>
                {rejected && i === 2 ? <XCircle size={16} /> : <Icon size={16} />}
              </div>
              <span className="text-[10px] text-slate-500 whitespace-nowrap">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-12 mx-1 mb-4 transition-colors ${done ? 'bg-owner' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
