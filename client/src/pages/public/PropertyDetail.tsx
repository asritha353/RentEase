import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '@/components/layout/Navbar'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { formatRent, formatDate, getBadgeColor, getPropTypeIcon } from '@/lib/utils'
import toast from 'react-hot-toast'
import { MapPin, Bed, Bath, Maximize2, Calendar, Eye, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function PropertyDetail() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [applying, setApplying] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ 
    message: '', 
    moveInDate: '', 
    tenantPhone: '', 
    tenantOccupation: '' 
  })

  useEffect(() => {
    if (user && showModal) {
      setForm(prev => ({
        ...prev,
        tenantPhone: prev.tenantPhone || user.phone || '',
        tenantOccupation: prev.tenantOccupation || user.occupation || ''
      }))
    }
  }, [user, showModal])

  useEffect(() => {
    api.get(`/properties/${id}`)
      .then(r => setProperty(r.data.property))
      .catch(() => navigate('/404'))
      .finally(() => setLoading(false))
  }, [id])

  const handleApply = async () => {
    if (!user) { toast.error('Please sign in first'); navigate('/login'); return }
    if (user.role !== 'TENANT') { toast.error('Only tenants can apply'); return }
    setApplying(true)
    try {
      await api.post('/applications', { 
        propertyId: id, 
        coverMessage: form.message,
        moveInDate: form.moveInDate,
        tenantPhone: form.tenantPhone,
        tenantOccupation: form.tenantOccupation
      })
      toast.success('Application submitted!')
      setShowModal(false)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to apply')
    }
    setApplying(false)
  }

  if (loading) return (
    <div className="min-h-screen"><Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="skeleton h-96 mb-6" />
        <div className="skeleton h-8 w-1/2 mb-3" />
        <div className="skeleton h-5 w-1/3" />
      </div>
    </div>
  )
  if (!property) return null

  const imgs = property.images?.length ? property.images : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800']

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>{property.title} — RentEase</title>
        <meta name="description" content={`${property.bedrooms}BHK in ${property.area}, ${property.city} for ₹${property.rent}/month. ${property.description?.slice(0,100)}`} />
      </Helmet>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-500 hover:text-primary text-sm mb-4 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-5">
            {/* Images */}
            <div className="card overflow-hidden">
              <div className="relative h-80">
                <img src={imgs[imgIdx]} alt={property.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`badge ${getBadgeColor(property.status)}`}>{property.status.replace('_',' ')}</span>
                  <span className={`badge ${getBadgeColor(property.furnished)}`}>{property.furnished.replace('_',' ')}</span>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs bg-black/40 rounded-full px-2 py-1">
                  <Eye size={12} /> {property.viewCount} views
                </div>
              </div>
              {imgs.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {imgs.map((img: string, i: number) => (
                    <img key={i} src={img} alt="" onClick={() => setImgIdx(i)}
                      className={`w-16 h-12 object-cover rounded-lg cursor-pointer border-2 transition-all ${imgIdx === i ? 'border-primary' : 'border-transparent'}`} />
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="card p-6">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-2xl">{getPropTypeIcon(property.propertyType)}</span>
                <h1 className="text-2xl font-bold text-slate-900">{property.title}</h1>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-5">
                <MapPin size={14} /> {property.address}, {property.area}, {property.city}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { icon: Bed,      label: 'Bedrooms',  value: `${property.bedrooms} BHK` },
                  { icon: Bath,     label: 'Bathrooms', value: property.bathrooms },
                  { icon: Maximize2,label: 'Floor Area', value: `${property.floorArea} sq.ft` },
                ].map(d => (
                  <div key={d.label} className="text-center p-3 bg-slate-50 rounded-xl">
                    <d.icon size={18} className="text-primary mx-auto mb-1" />
                    <div className="font-semibold text-slate-800 text-sm">{d.value}</div>
                    <div className="text-xs text-slate-400">{d.label}</div>
                  </div>
                ))}
              </div>

              <h3 className="font-semibold text-slate-800 mb-2">Description</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-5">{property.description}</p>

              {property.amenities?.length > 0 && (
                <>
                  <h3 className="font-semibold text-slate-800 mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((a: string) => (
                      <span key={a} className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary rounded-xl text-xs font-medium">
                        <CheckCircle2 size={12} /> {a}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <div className="card p-5 sticky top-20">
              <div className="text-3xl font-bold text-slate-900">{formatRent(property.rent)}<span className="text-base font-normal text-slate-400">/month</span></div>
              <div className="text-sm text-slate-500 mt-1">Deposit: {formatRent(property.deposit)}</div>
              <div className="my-4 border-t border-slate-100" />
              <div className="space-y-2 text-sm text-slate-600 mb-5">
                <div className="flex justify-between"><span>Type</span><span className="font-medium">{property.propertyType.replace('_',' ')}</span></div>
                <div className="flex justify-between"><span>Listed</span><span className="font-medium">{formatDate(property.listedAt)}</span></div>
                <div className="flex justify-between"><span>Owner</span><span className="font-medium">{property.owner?.name}</span></div>
              </div>

              {property.status === 'AVAILABLE' && user?.role === 'TENANT' && (
                <button onClick={() => setShowModal(true)} className="btn-primary w-full text-sm py-3">Apply Now</button>
              )}
              {!user && property.status === 'AVAILABLE' && (
                <button onClick={() => navigate('/login')} className="btn-primary w-full text-sm py-3">Sign in to Apply</button>
              )}
              {property.status !== 'AVAILABLE' && (
                <div className="text-center text-slate-400 text-sm py-3 bg-slate-50 rounded-xl">Not Available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Apply for this Property</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Phone Number <span className="text-red-500">*</span></label>
                <input value={form.tenantPhone} onChange={e => setForm(f => ({...f, tenantPhone: e.target.value}))} className="input" placeholder="e.g. +91 9876543210" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Your Occupation <span className="text-red-500">*</span></label>
                <input value={form.tenantOccupation} onChange={e => setForm(f => ({...f, tenantOccupation: e.target.value}))} className="input" placeholder="e.g. Software Engineer" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Preferred Move-in Date</label>
                <input type="date" value={form.moveInDate} onChange={e => setForm(f => ({...f, moveInDate: e.target.value}))} className="input" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Message to Owner <span className="text-red-500">*</span></label>
                <textarea value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))}
                  className="input resize-none h-24" placeholder="Introduce yourself, why you're interested..." required />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
              <button onClick={handleApply} disabled={applying} className="btn-primary flex-1 disabled:opacity-50">
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
