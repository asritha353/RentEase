import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import PropertyCard from '@/components/property/PropertyCard'
import SkeletonCard from '@/components/property/SkeletonCard'
import api from '@/lib/api'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'

export default function TenantSaved() {
  const [saved, setSaved] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/saved').then(r => setSaved(r.data.saved)).finally(() => setLoading(false))
  }, [])

  const handleUnsave = (id: string) => setSaved(prev => prev.filter(p => p.id !== id))

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
        <h1 className="page-header mb-6">Saved Properties ❤️</h1>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">{Array(3).fill(0).map((_,i) => <SkeletonCard key={i} />)}</div>
        ) : saved.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">💔</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No saved properties</h3>
            <p className="text-slate-500 mb-6">Tap the heart icon on any listing to save it here</p>
            <Link to="/tenant/search" className="btn-primary flex items-center gap-2 w-fit mx-auto"><Search size={16}/> Browse Properties</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {saved.map(p => <PropertyCard key={p.id} property={p} saved onSaveToggle={handleUnsave} />)}
          </div>
        )}
      </div>
    </div>
  )
}
