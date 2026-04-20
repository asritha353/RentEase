import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '@/components/layout/Navbar'
import PropertyCard from '@/components/property/PropertyCard'
import SkeletonCard from '@/components/property/SkeletonCard'
import api from '@/lib/api'
import { CITIES, PROPERTY_TYPES, FURNISHED_TYPES } from '@/lib/utils'
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function PropertiesPage() {
  const [params, setParams] = useSearchParams()
  const [properties, setProperties] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const [city,     setCity]     = useState(params.get('city')    || '')
  const [area,     setArea]     = useState(params.get('area')    || '')
  const [minRent,  setMinRent]  = useState(params.get('minRent') || '5000')
  const [maxRent,  setMaxRent]  = useState(params.get('maxRent') || '150000')
  const [bedrooms, setBedrooms] = useState(params.get('bedrooms')|| '')
  const [propType, setPropType] = useState(params.get('propertyType') || '')
  const [furnished,setFurnished]= useState(params.get('furnished')   || '')
  const [sort,     setSort]     = useState(params.get('sort')        || '')
  const [page,     setPage]     = useState(1)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const q: any = { page, limit: 12 }
      if (city)     q.city = city
      if (area)     q.area = area
      if (bedrooms) q.bedrooms = bedrooms
      if (propType) q.propertyType = propType
      if (furnished)q.furnished = furnished
      if (sort)     q.sort = sort
      if (minRent !== '5000')   q.minRent = minRent
      if (maxRent !== '150000') q.maxRent = maxRent

      const { data } = await api.get('/properties', { params: q })
      setProperties(data.properties)
      setTotal(data.total)
      setPages(data.pages)
    } catch { setProperties([]) }
    setLoading(false)
  }, [city, area, minRent, maxRent, bedrooms, propType, furnished, sort, page])

  useEffect(() => { fetch() }, [fetch])

  const clearFilters = () => { setCity(''); setArea(''); setMinRent('5000'); setMaxRent('150000'); setBedrooms(''); setPropType(''); setFurnished(''); setSort(''); setPage(1) }

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet><title>Browse Rentals — RentEase</title></Helmet>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-header">Browse Properties</h1>
            <p className="text-slate-500 text-sm">{total} properties found</p>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 btn-outline text-sm">
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="card p-5 mb-6 animate-slide-down">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">City</label>
                <select value={city} onChange={e => { setCity(e.target.value); setPage(1) }} className="input text-sm">
                  <option value="">All Cities</option>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Area / Locality</label>
                <input value={area} onChange={e => { setArea(e.target.value); setPage(1) }} className="input text-sm" placeholder="e.g. Kondapur" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Bedrooms</label>
                <select value={bedrooms} onChange={e => { setBedrooms(e.target.value); setPage(1) }} className="input text-sm">
                  <option value="">Any</option>
                  {[1,2,3,4].map(n => <option key={n} value={n}>{n === 4 ? '4+' : n} BHK</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Property Type</label>
                <select value={propType} onChange={e => { setPropType(e.target.value); setPage(1) }} className="input text-sm">
                  <option value="">All Types</option>
                  {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Furnishing</label>
                <select value={furnished} onChange={e => { setFurnished(e.target.value); setPage(1) }} className="input text-sm">
                  <option value="">Any</option>
                  {FURNISHED_TYPES.map(f => <option key={f} value={f}>{f.replace('_',' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Min Rent (₹)</label>
                <input type="number" value={minRent} onChange={e => { setMinRent(e.target.value); setPage(1) }} className="input text-sm" placeholder="5000" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Max Rent (₹)</label>
                <input type="number" value={maxRent} onChange={e => { setMaxRent(e.target.value); setPage(1) }} className="input text-sm" placeholder="150000" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Sort By</label>
                <select value={sort} onChange={e => setSort(e.target.value)} className="input text-sm">
                  <option value="">Newest First</option>
                  <option value="rent_asc">Rent: Low to High</option>
                  <option value="rent_desc">Rent: High to Low</option>
                </select>
              </div>
            </div>
            <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-500 transition-colors">
              <X size={14} /> Clear all filters
            </button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(9).fill(0).map((_,i) => <SkeletonCard key={i} />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏚️</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No properties found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your filters</p>
            <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && !loading && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button disabled={page === 1} onClick={() => setPage(p => p-1)} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-100">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm text-slate-600">Page {page} of {pages}</span>
            <button disabled={page === pages} onClick={() => setPage(p => p+1)} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-100">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
