import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, Loader2, Mail, Lock } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { signInWithGoogle } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  // ── Email / Password ──────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Please enter email and password')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setAuth(data.user, data.token)
      toast.success('Welcome back!')
      redirect(data.user.role)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  // ── Google (Supabase OAuth) ───────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      // Store role before redirect (login = existing user, so no role needed)
      localStorage.removeItem('pendingGoogleRole')
      const { error } = await signInWithGoogle()
      if (error) throw error
      // Page will redirect to /auth/callback — no further action here
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message || 'Google login failed')
    }
  }

  const redirect = (role: string) => {
    if (role === 'ADMIN') navigate('/admin/dashboard')
    else if (role === 'OWNER') navigate('/owner/dashboard')
    else navigate('/tenant/dashboard')
  }

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('password123')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 font-bold text-2xl text-slate-900 mb-8">
          <Home className="text-primary" size={28} /> RentEase
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-slate-900">Sign in to your account</h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{' '}
          <Link to="/register" className="font-medium text-primary hover:text-primary-700 transition-colors">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl sm:px-10 border border-slate-100">

          {/* Google Button */}
          <button
            type="button" onClick={handleGoogleLogin} disabled={loading}
            className="w-full flex justify-center items-center gap-3 py-3 px-4 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-60 transition-all mb-6"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-400 font-medium">or sign in with email</span>
            </div>
          </div>

          {/* Email / Password Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="email" required className="input pl-10" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="password" required className="input pl-10" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-primary py-3 text-sm font-bold flex justify-center items-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign in'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-400">Quick demo access</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Owner',  email: 'ravi.owner@rentease.in',     cls: 'text-owner border-owner hover:bg-owner-50' },
                { label: 'Tenant', email: 'ananya.tenant@rentease.in',  cls: 'text-tenant border-tenant hover:bg-tenant-50' },
              ].map(d => (
                <button key={d.label} type="button" onClick={() => fillDemo(d.email)}
                  className={`py-2 px-2 rounded-xl border-2 text-xs font-bold transition-colors ${d.cls}`}>
                  {d.label}
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">
              Click to autofill · password: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">password123</code>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
