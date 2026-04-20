import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { CITIES, PROPERTY_TYPES, FURNISHED_TYPES } from '@/lib/utils'
import { Upload, X, Lightbulb } from 'lucide-react'

const AMENITIES = ['Wi-Fi','AC','Parking','Gym','Power Backup','Security','Lift','Garden','Swimming Pool','CCTV','Housekeeping','Meals','Washing Machine','Geyser','Intercom']
const STEPS = ['Basic Info','Property Details','Photos & Submit']

const empty = { title:'',propertyType:'APARTMENT',city:'Hyderabad',area:'',address:'',rent:'',deposit:'',bedrooms:'1',bathrooms:'1',floorArea:'',furnished:'SEMI_FURNISHED',amenities:[] as string[],description:'',status:'AVAILABLE' }

export default function OwnerPropertyForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [step, setStep] = useState(0)
  const [form, setForm] = useState(empty)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState('')
  const [errors, setErrors] = useState<Record<string,string>>({})

  useEffect(() => {
    if (isEdit) {
      api.get(`/properties/${id}`).then(r => {
        const p = r.data.property
        setForm({ title:p.title, propertyType:p.propertyType, city:p.city, area:p.area, address:p.address, rent:String(p.rent), deposit:String(p.deposit), bedrooms:String(p.bedrooms), bathrooms:String(p.bathrooms), floorArea:String(p.floorArea), furnished:p.furnished, amenities:p.amenities, description:p.description, status:p.status })
        setPreviews(p.images || [])
      })
    }
  }, [id])

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const toggleAmenity = (a: string) =>
    set('amenities', form.amenities.includes(a) ? form.amenities.filter(x => x !== a) : [...form.amenities, a])

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []).slice(0, 6 - files.length)
    setFiles(f => [...f, ...picked])
    picked.forEach(f => { const r = new FileReader(); r.onload = ev => setPreviews(p => [...p, ev.target!.result as string]); r.readAsDataURL(f) })
  }

  const removeImg = (i: number) => {
    setFiles(f => f.filter((_,j) => j !== i))
    setPreviews(p => p.filter((_,j) => j !== i))
  }

  const getSuggestion = async () => {
    if (!form.city || !form.area || !form.bedrooms) return
    try {
      const { data } = await api.post('/properties/suggest-rent', { city: form.city, area: form.area, bedrooms: form.bedrooms, propertyType: form.propertyType })
      if (data.suggestion) setSuggestion(data.suggestion)
    } catch {}
  }

  const validateStep = () => {
    const e: Record<string,string> = {}
    if (step === 0) {
      if (!form.title.trim()) e.title = 'Title required'
      if (!form.area.trim())  e.area  = 'Area required'
      if (!form.address.trim()) e.address = 'Address required'
    }
    if (step === 1) {
      if (!form.rent || Number(form.rent) < 1000) e.rent = 'Enter valid rent'
      if (!form.deposit) e.deposit = 'Deposit required'
      if (!form.floorArea) e.floorArea = 'Floor area required'
      if (!form.description.trim()) e.description = 'Description required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validateStep()) setStep(s => s + 1) }

  const submit = async () => {
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach(x => fd.append(k, x))
        else fd.append(k, String(v))
      })
      files.forEach(f => fd.append('images', f))
      previews.filter(p => p.startsWith('http')).forEach(url => fd.append('existingImages', url))

      if (isEdit) await api.put(`/properties/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      else        await api.post('/properties', fd, { headers: { 'Content-Type': 'multipart/form-data' } })

      toast.success(isEdit ? 'Property updated!' : 'Property listed!')
      navigate('/owner/properties')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save')
    }
    setLoading(false)
  }

  const inp = (k: string, label: string, props: any = {}) => (
    <div>
      <label className="text-xs font-medium text-slate-600 mb-1 block">{label}</label>
      <input value={(form as any)[k]} onChange={e => set(k, e.target.value)} className={`input ${errors[k] ? 'border-red-400' : ''}`} {...props} />
      {errors[k] && <p className="text-xs text-red-500 mt-1">{errors[k]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        <h1 className="page-header mb-6">{isEdit ? 'Edit Property' : 'Add New Property'}</h1>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${i < step ? 'bg-owner text-white' : i === step ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>{i < step ? '✓' : i+1}</div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-primary' : 'text-slate-400'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < step ? 'bg-owner' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <div className="card p-6 space-y-5">
          {/* Step 0 */}
          {step === 0 && <>
            {inp('title','Property Title',{placeholder:'e.g. Spacious 2BHK in Kondapur'})}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Property Type</label>
                <select value={form.propertyType} onChange={e => set('propertyType',e.target.value)} className="input">
                  {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">City</label>
                <select value={form.city} onChange={e => set('city',e.target.value)} className="input">
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            {inp('area','Area / Locality',{placeholder:'e.g. Kondapur, Gachibowli'})}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Full Address</label>
              <textarea value={form.address} onChange={e => set('address',e.target.value)} className={`input resize-none h-20 ${errors.address?'border-red-400':''}`} placeholder="Plot No, Street, Colony..." />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
            </div>
          </>}

          {/* Step 1 */}
          {step === 1 && <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Monthly Rent (₹)</label>
                <input type="number" value={form.rent} onChange={e => { set('rent',e.target.value); setSuggestion('') }} onBlur={getSuggestion} className={`input ${errors.rent?'border-red-400':''}`} placeholder="20000" />
                {errors.rent && <p className="text-xs text-red-500 mt-1">{errors.rent}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Security Deposit (₹)</label>
                <input type="number" value={form.deposit} onChange={e => set('deposit',e.target.value)} className="input" placeholder="60000" />
                <button type="button" onClick={() => set('deposit', String(Number(form.rent)*3))} className="text-[10px] text-primary hover:underline mt-0.5">Auto: 3× rent</button>
              </div>
            </div>
            {suggestion && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                <Lightbulb size={16} className="shrink-0 mt-0.5 text-amber-500" />{suggestion}
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Bedrooms</label>
                <select value={form.bedrooms} onChange={e => set('bedrooms',e.target.value)} className="input">
                  {[1,2,3,4].map(n => <option key={n} value={n}>{n === 4?'4+':n} BHK</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Bathrooms</label>
                <select value={form.bathrooms} onChange={e => set('bathrooms',e.target.value)} className="input">
                  {[1,2,3].map(n => <option key={n} value={n}>{n === 3?'3+':n}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Floor Area (sq.ft)</label>
                <input type="number" value={form.floorArea} onChange={e => set('floorArea',e.target.value)} className={`input ${errors.floorArea?'border-red-400':''}`} placeholder="1050" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Furnishing Status</label>
              <div className="flex gap-2">
                {FURNISHED_TYPES.map(f => (
                  <button key={f} type="button" onClick={() => set('furnished',f)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-colors ${form.furnished===f?'border-primary bg-primary-50 text-primary':'border-slate-200 text-slate-500'}`}>
                    {f.replace('_',' ')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-2 block">Amenities</label>
              <div className="grid grid-cols-3 gap-2">
                {AMENITIES.map(a => (
                  <label key={a} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs transition-colors ${form.amenities.includes(a)?'border-primary bg-primary-50 text-primary':'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    <input type="checkbox" className="hidden" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                    {form.amenities.includes(a)?'✓':''} {a}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Description <span className="text-slate-400">({form.description.length}/500)</span></label>
              <textarea value={form.description} onChange={e => e.target.value.length <= 500 && set('description',e.target.value)} className={`input resize-none h-28 ${errors.description?'border-red-400':''}`} placeholder="Describe the property..." />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>
          </>}

          {/* Step 2 */}
          {step === 2 && <>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-2 block">Property Photos ({previews.length}/6)</label>
              <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-8 cursor-pointer transition-colors ${previews.length >= 6 ? 'border-slate-200 opacity-50 cursor-not-allowed' : 'border-primary/40 hover:border-primary bg-primary-50/30'}`}>
                <Upload size={24} className="text-primary mb-2" />
                <span className="text-sm text-primary font-medium">Click to upload photos</span>
                <span className="text-xs text-slate-400 mt-1">JPG, PNG, WebP up to 5MB each</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={addFiles} disabled={previews.length >= 6} />
              </label>
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative h-24 rounded-xl overflow-hidden group">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImg(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-2 text-slate-600">
              <p className="font-semibold text-slate-800 mb-2">Review Summary</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <span>Title:</span><span className="font-medium text-slate-800 truncate">{form.title}</span>
                <span>Type:</span><span className="font-medium">{form.propertyType}</span>
                <span>Location:</span><span className="font-medium">{form.area}, {form.city}</span>
                <span>Rent:</span><span className="font-medium">₹{Number(form.rent).toLocaleString('en-IN')}/mo</span>
                <span>Bedrooms:</span><span className="font-medium">{form.bedrooms} BHK</span>
                <span>Furnishing:</span><span className="font-medium">{form.furnished}</span>
              </div>
            </div>
          </>}

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            {step > 0 && <button type="button" onClick={() => setStep(s => s-1)} className="btn-outline flex-1">← Back</button>}
            {step < 2 && <button type="button" onClick={next} className="btn-primary flex-1">Next →</button>}
            {step === 2 && (
              <button type="button" onClick={submit} disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
                {loading ? 'Saving...' : isEdit ? 'Update Property' : 'List Property 🎉'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
