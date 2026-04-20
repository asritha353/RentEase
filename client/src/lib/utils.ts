export const formatRent = (n: number) =>
  '₹' + n.toLocaleString('en-IN')

export const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export const getBadgeColor = (status: string) => {
  const map: Record<string, string> = {
    AVAILABLE:    'bg-owner-50 text-owner-700',
    RENTED:       'bg-slate-100 text-slate-500',
    UNDER_REVIEW: 'bg-amber-50 text-amber-700',
    INACTIVE:     'bg-red-50 text-red-500',
    PENDING:      'bg-amber-50 text-amber-700',
    ACCEPTED:     'bg-owner-50 text-owner-700',
    REJECTED:     'bg-red-50 text-red-500',
    WITHDRAWN:    'bg-slate-100 text-slate-500',
    FURNISHED:      'bg-primary-50 text-primary-700',
    SEMI_FURNISHED: 'bg-purple-50 text-purple-700',
    UNFURNISHED:    'bg-slate-100 text-slate-600',
    ACTIVE:  'bg-owner-50 text-owner-700',
    BLOCKED: 'bg-red-50 text-red-500',
  }
  return map[status] || 'bg-slate-100 text-slate-600'
}

export const getPropTypeIcon = (type: string) => {
  const map: Record<string, string> = {
    APARTMENT: '🏢', VILLA: '🏡', STUDIO: '🏠',
    INDEPENDENT_HOUSE: '🏘️', PG: '🏨',
  }
  return map[type] || '🏠'
}

export const CITIES = ['Hyderabad','Bangalore','Mumbai','Chennai','Pune','Vijayawada','Guntur','Ongole','Amaravati','Tadepalli']
export const PROPERTY_TYPES = ['APARTMENT','VILLA','STUDIO','INDEPENDENT_HOUSE','PG']
export const FURNISHED_TYPES = ['FURNISHED','SEMI_FURNISHED','UNFURNISHED']
