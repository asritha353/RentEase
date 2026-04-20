import { Link } from 'react-router-dom'
import { Heart, MapPin, Bed, Bath, Maximize2 } from 'lucide-react'
import { formatRent, getBadgeColor, getPropTypeIcon } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface Props {
  property: any
  saved?: boolean
  onSaveToggle?: (id: string, saved: boolean) => void
}

export default function PropertyCard({ property: p, saved = false, onSaveToggle }: Props) {
  const { user } = useAuthStore()
  const [isSaved, setIsSaved] = useState(saved)
  const [saving, setSaving] = useState(false)

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user || user.role !== 'TENANT') { toast.error('Sign in as tenant to save properties'); return }
    setSaving(true)
    try {
      if (isSaved) {
        await api.delete(`/saved/${p.id}`)
        setIsSaved(false)
        toast.success('Removed from saved')
      } else {
        await api.post(`/saved/${p.id}`)
        setIsSaved(true)
        toast.success('Saved to wishlist!')
      }
      onSaveToggle?.(p.id, !isSaved)
    } catch { toast.error('Failed to update') }
    setSaving(false)
  }

  const img = p.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600'

  return (
    <Link to={`/properties/${p.id}`} className="card group block hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img src={img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className={`badge ${getBadgeColor(p.status)} text-[10px]`}>{p.status.replace('_',' ')}</span>
          <span className={`badge ${getBadgeColor(p.furnished)} text-[10px]`}>{p.furnished.replace('_',' ')}</span>
        </div>
        {/* Save button */}
        <button onClick={toggleSave} disabled={saving}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors shadow-sm">
          <Heart size={14} className={isSaved ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
        </button>
        {/* Type icon */}
        <span className="absolute bottom-3 left-3 text-lg">{getPropTypeIcon(p.propertyType)}</span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-1 line-clamp-1">{p.title}</h3>
        <div className="flex items-center gap-1 text-slate-500 text-xs mb-3">
          <MapPin size={11} /> <span>{p.area}, {p.city}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1"><Bed size={12} /> {p.bedrooms} BHK</span>
          <span className="flex items-center gap-1"><Bath size={12} /> {p.bathrooms}</span>
          <span className="flex items-center gap-1"><Maximize2 size={12} /> {p.floorArea} sq.ft</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-slate-900">{formatRent(p.rent)}</span>
            <span className="text-xs text-slate-400">/month</span>
          </div>
          <span className="text-xs bg-primary-50 text-primary px-2.5 py-1 rounded-full font-medium">View Details →</span>
        </div>
      </div>
    </Link>
  )
}
