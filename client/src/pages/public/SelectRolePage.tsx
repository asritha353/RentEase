import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Home, Building2, Check } from 'lucide-react'

export default function SelectRolePage() {
  const [role, setRole] = useState<'OWNER'|'TENANT'|null>(null)
  const [loading, setLoading] = useState(false)
  const { user, setAuth, token } = useAuthStore()
  const navigate = useNavigate()

  const confirm = async () => {
    if (!role) return
    setLoading(true)
    try {
      const { data } = await api.post('/auth/select-role', { role })
      setAuth(data.user, data.token)
      toast.success(`You're all set as ${role === 'OWNER' ? 'a Property Owner' : 'a Tenant'}!`)
      navigate(`/${role.toLowerCase()}/dashboard`)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to set role')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <Helmet><title>Choose Your Role — RentEase</title></Helmet>
      <div className="w-full max-w-lg animate-slide-up text-center">
        <div className="text-white font-bold text-2xl mb-2 flex items-center justify-center gap-2"><Home size={24} /> RentEase</div>
        <h1 className="text-3xl font-bold text-white mb-2">How will you use RentEase?</h1>
        <p className="text-slate-400 mb-10">Your role determines your dashboard. This cannot be changed later.</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Tenant */}
          <button onClick={() => setRole('TENANT')}
            className={`relative p-6 rounded-2xl border-2 text-left transition-all ${role === 'TENANT' ? 'border-tenant bg-tenant/10' : 'border-slate-600 bg-slate-800 hover:border-slate-400'}`}>
            {role === 'TENANT' && <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-tenant flex items-center justify-center"><Check size={14} className="text-white" /></div>}
            <div className="text-4xl mb-3">🏃</div>
            <h3 className="text-white font-bold text-lg mb-1">I'm a Tenant</h3>
            <p className="text-slate-400 text-sm">Looking for a rental home</p>
            <ul className="mt-4 space-y-1 text-xs text-slate-300">
              <li>✓ Browse & filter listings</li>
              <li>✓ Apply to properties</li>
              <li>✓ Download agreements</li>
              <li>✓ Save favourites</li>
            </ul>
          </button>

          {/* Owner */}
          <button onClick={() => setRole('OWNER')}
            className={`relative p-6 rounded-2xl border-2 text-left transition-all ${role === 'OWNER' ? 'border-owner bg-owner/10' : 'border-slate-600 bg-slate-800 hover:border-slate-400'}`}>
            {role === 'OWNER' && <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-owner flex items-center justify-center"><Check size={14} className="text-white" /></div>}
            <div className="text-4xl mb-3">🏠</div>
            <h3 className="text-white font-bold text-lg mb-1">I'm an Owner</h3>
            <p className="text-slate-400 text-sm">I want to list my property</p>
            <ul className="mt-4 space-y-1 text-xs text-slate-300">
              <li>✓ List up to 20 properties</li>
              <li>✓ Manage applications</li>
              <li>✓ Generate agreements</li>
              <li>✓ Analytics dashboard</li>
            </ul>
          </button>
        </div>

        <button onClick={confirm} disabled={!role || loading}
          className="w-full py-4 rounded-xl font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: role === 'TENANT' ? '#FF5A1F' : role === 'OWNER' ? '#0E9F6E' : '#64748b' }}>
          {loading ? 'Setting up your account...' : role ? `Continue as ${role === 'TENANT' ? 'Tenant' : 'Owner'} →` : 'Select a role to continue'}
        </button>
      </div>
    </div>
  )
}
