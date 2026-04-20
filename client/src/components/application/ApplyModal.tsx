import { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, CheckCircle, Loader2, Phone, Briefcase, DollarSign, Home, Calendar, Users, PawPrint, MessageSquare } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const OCCUPATIONS = [
  'Salaried (Private Sector)', 'Salaried (Government)',
  'Self-Employed', 'Business Owner', 'Student', 'Freelancer', 'Other'
]

interface ApplyModalProps {
  property: {
    id: string; title: string; rent: number; city: string; area: string; images: string[]
  }
  onClose: () => void
}

type Step = 1 | 2

export default function ApplyModal({ property, onClose }: ApplyModalProps) {
  const { user } = useAuthStore()
  const navigate  = useNavigate()
  const [step, setStep]         = useState<Step>(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]   = useState<string | null>(null)
  const [alreadyApplied, setAlreadyApplied] = useState(false)

  const [form, setForm] = useState({
    tenantPhone:        '',
    tenantOccupation:   '',
    tenantIncome:       '',
    currentResidence:   '',
    moveInDate:         '',
    occupantCount:      1,
    hasPets:            false,
    coverMessage:       '',
    specialRequirements: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Check for existing application
  useEffect(() => {
    api.get('/applications/mine').then(r => {
      const exists = r.data.applications?.find(
        (a: any) => a.propertyId === property.id && !['WITHDRAWN', 'REJECTED'].includes(a.status)
      )
      if (exists) setAlreadyApplied(true)
    }).catch(() => {})
  }, [property.id])

  const set = (k: string, v: any) => {
    setForm(prev => ({ ...prev, [k]: v }))
    setErrors(prev => ({ ...prev, [k]: '' }))
  }

  const validateStep1 = () => {
    const errs: Record<string, string> = {}
    if (!/^[6-9]\d{9}$/.test(form.tenantPhone))
      errs.tenantPhone = 'Enter a valid 10-digit Indian mobile number (starts with 6-9)'
    if (!form.tenantOccupation) errs.tenantOccupation = 'Please select your occupation'
    if (!form.tenantIncome || parseInt(form.tenantIncome) <= 0) errs.tenantIncome = 'Enter your monthly income'
    if (!form.currentResidence.trim()) errs.currentResidence = 'Enter your current address'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep2 = () => {
    const errs: Record<string, string> = {}
    if (!form.moveInDate) errs.moveInDate = 'Please select a preferred move-in date'
    else if (new Date(form.moveInDate) < new Date()) errs.moveInDate = 'Move-in date cannot be in the past'
    if (form.coverMessage.trim().length < 50)
      errs.coverMessage = `At least 50 characters required (${form.coverMessage.trim().length}/50)`
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => { if (validateStep1()) setStep(2) }

  const submit = async () => {
    if (!validateStep2()) return
    setSubmitting(true)
    try {
      const { data } = await api.post('/applications', {
        propertyId:         property.id,
        tenantPhone:        form.tenantPhone,
        tenantOccupation:   form.tenantOccupation,
        tenantIncome:       parseInt(form.tenantIncome),
        currentResidence:   form.currentResidence,
        moveInDate:         form.moveInDate,
        occupantCount:      form.occupantCount,
        hasPets:            form.hasPets,
        coverMessage:       form.coverMessage.trim(),
        specialRequirements: form.specialRequirements.trim() || undefined,
      })
      setSuccess(data.application.id)
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to submit application'
      if (err.response?.status === 409) setAlreadyApplied(true)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 90)
  const incomeWarning = form.tenantIncome && parseInt(form.tenantIncome) < property.rent * 2.5
    ? `Your income is below the recommended 2.5× monthly rent (₹${(property.rent * 2.5).toLocaleString('en-IN')}). You can still apply.`
    : null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Apply for Property</h2>
              <p className="text-sm text-slate-500 mt-0.5 truncate max-w-xs">{property.title}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><X size={18} /></button>
          </div>

          {/* Progress bar */}
          {!success && !alreadyApplied && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                {[1, 2].map(s => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      s < step ? 'bg-primary text-white' : s === step ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                    }`}>{s < step ? '✓' : s}</div>
                    {s < 2 && <div className={`h-1 w-16 rounded-full transition-colors ${step > s ? 'bg-primary' : 'bg-slate-100'}`} />}
                  </div>
                ))}
                <div className="ml-auto text-xs text-slate-500">Step {step} of 2</div>
              </div>
              <div className="text-sm font-medium text-slate-700">
                {step === 1 ? '📋 Personal & Contact Details' : '🏡 Tenancy Preferences'}
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* Already Applied */}
          {alreadyApplied && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Already Applied</h3>
              <p className="text-slate-500 text-sm mb-6">You've already submitted an application for this property. Track its status in your dashboard.</p>
              <button onClick={() => navigate('/tenant/applications')} className="btn-primary">View My Applications</button>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="text-center py-8">
              <CheckCircle size={52} className="text-owner mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Application Submitted! 🎉</h3>
              <p className="text-slate-500 text-sm mb-2">Your application has been sent to the owner.</p>
              <div className="bg-slate-50 rounded-xl p-3 text-xs font-mono text-slate-500 mb-6">
                Ref: {success.slice(0, 8).toUpperCase()}
              </div>
              <button onClick={() => navigate('/tenant/applications')} className="btn-primary w-full">
                Track Application Status
              </button>
            </div>
          )}

          {/* Step 1 */}
          {!success && !alreadyApplied && step === 1 && (
            <div className="space-y-4">
              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  <Phone size={13} className="inline mr-1.5" />Phone Number
                </label>
                <div className="flex">
                  <span className="px-3 py-2.5 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl text-sm text-slate-500 font-medium">+91</span>
                  <input value={form.tenantPhone} onChange={e => set('tenantPhone', e.target.value)}
                    className={`input rounded-l-none flex-1 ${errors.tenantPhone ? 'border-red-400' : ''}`}
                    placeholder="9876543210" maxLength={10} />
                </div>
                {errors.tenantPhone && <p className="text-red-500 text-xs mt-1">{errors.tenantPhone}</p>}
                <p className="text-slate-400 text-xs mt-1">Owner will contact you on this number</p>
              </div>

              {/* Occupation */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  <Briefcase size={13} className="inline mr-1.5" />Current Occupation
                </label>
                <select value={form.tenantOccupation} onChange={e => set('tenantOccupation', e.target.value)}
                  className={`input ${errors.tenantOccupation ? 'border-red-400' : ''}`}>
                  <option value="">Select occupation...</option>
                  {OCCUPATIONS.map(o => <option key={o}>{o}</option>)}
                </select>
                {errors.tenantOccupation && <p className="text-red-500 text-xs mt-1">{errors.tenantOccupation}</p>}
              </div>

              {/* Income */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  <DollarSign size={13} className="inline mr-1.5" />Monthly Income (₹)
                </label>
                <input type="number" value={form.tenantIncome} onChange={e => set('tenantIncome', e.target.value)}
                  className={`input ${errors.tenantIncome ? 'border-red-400' : ''}`}
                  placeholder="e.g. 80000" min={0} />
                {errors.tenantIncome && <p className="text-red-500 text-xs mt-1">{errors.tenantIncome}</p>}
                {incomeWarning && !errors.tenantIncome && (
                  <p className="text-amber-600 text-xs mt-1">⚠️ {incomeWarning}</p>
                )}
                <p className="text-slate-400 text-xs mt-1">Recommended: at least 2.5× monthly rent (₹{(property.rent * 2.5).toLocaleString('en-IN')})</p>
              </div>

              {/* Current Residence */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  <Home size={13} className="inline mr-1.5" />Current Residence
                </label>
                <input value={form.currentResidence} onChange={e => set('currentResidence', e.target.value)}
                  className={`input ${errors.currentResidence ? 'border-red-400' : ''}`}
                  placeholder="Your current full address" />
                {errors.currentResidence && <p className="text-red-500 text-xs mt-1">{errors.currentResidence}</p>}
                <p className="text-slate-400 text-xs mt-1">Helps owner understand your situation</p>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {!success && !alreadyApplied && step === 2 && (
            <div className="space-y-4">
              {/* Move-in Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  <Calendar size={13} className="inline mr-1.5" />Preferred Move-in Date
                </label>
                <input type="date" value={form.moveInDate} onChange={e => set('moveInDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  max={maxDate.toISOString().split('T')[0]}
                  className={`input ${errors.moveInDate ? 'border-red-400' : ''}`} />
                {errors.moveInDate && <p className="text-red-500 text-xs mt-1">{errors.moveInDate}</p>}
                <p className="text-slate-400 text-xs mt-1">Within the next 90 days</p>
              </div>

              {/* Occupants */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  <Users size={13} className="inline mr-1.5" />Number of Occupants (including yourself)
                </label>
                <div className="flex items-center gap-3">
                  <button onClick={() => set('occupantCount', Math.max(1, form.occupantCount - 1))}
                    className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-600">−</button>
                  <span className="text-xl font-bold w-8 text-center">{form.occupantCount}</span>
                  <button onClick={() => set('occupantCount', Math.min(6, form.occupantCount + 1))}
                    className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-600">+</button>
                </div>
              </div>

              {/* Pets */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <PawPrint size={13} className="inline mr-1.5" />Will you have pets?
                </label>
                <div className="flex gap-3">
                  {[false, true].map(v => (
                    <button key={String(v)} onClick={() => set('hasPets', v)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors ${
                        form.hasPets === v ? 'border-primary bg-primary-50 text-primary' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}>
                      {v ? '🐾 Yes' : '🚫 No'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cover Message */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  <MessageSquare size={13} className="inline mr-1.5" />Cover Message to Owner <span className="text-red-400">*</span>
                </label>
                <textarea value={form.coverMessage} onChange={e => set('coverMessage', e.target.value)}
                  rows={4} className={`input resize-none ${errors.coverMessage ? 'border-red-400' : ''}`}
                  placeholder="Introduce yourself — your profession, lifestyle, why you're interested in this property, and why you'd be a great tenant..." />
                <div className="flex justify-between mt-1">
                  {errors.coverMessage
                    ? <p className="text-red-500 text-xs">{errors.coverMessage}</p>
                    : <p className="text-slate-400 text-xs">Minimum 50 characters</p>}
                  <span className={`text-xs ${form.coverMessage.length < 50 ? 'text-amber-500' : 'text-owner'}`}>
                    {form.coverMessage.length}/500
                  </span>
                </div>
              </div>

              {/* Special Requirements */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Special Requirements <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea value={form.specialRequirements} onChange={e => set('specialRequirements', e.target.value)}
                  rows={2} maxLength={200} className="input resize-none"
                  placeholder="Any special needs or questions for the owner..." />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!success && !alreadyApplied && (
          <div className="px-6 pb-6 pt-3 border-t border-slate-100 shrink-0 flex gap-3">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold">
                <ChevronLeft size={16} /> Back
              </button>
            )}
            {step === 1 ? (
              <button onClick={next} className="btn-primary flex-1 flex items-center justify-center gap-2">
                Next: Tenancy Preferences <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={submit} disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : 'Submit Application'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
