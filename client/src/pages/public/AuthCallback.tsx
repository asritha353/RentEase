import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'

// This page handles the OAuth redirect from Supabase after Google login.
// Supabase redirects to /auth/callback?code=... and we exchange the session.
export default function AuthCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const setAuth = useAuthStore(s => s.setAuth)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true;
    let authListener: any = null;

    // Supabase redirects back with error in URL if OAuth fails
    const urlError = params.get('error') || params.get('error_description');
    if (urlError) {
      setError(`OAuth Error: ${urlError.replace(/\+/g, ' ')}`);
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    const processSession = async (session: any) => {
      try {
        if (!session?.access_token) throw new Error('No access token received')

        // Prevent double processing in Strict Mode
        if (!mounted) return;

        const pendingRole = localStorage.getItem('pendingGoogleRole') || 'TENANT'
        localStorage.removeItem('pendingGoogleRole')

        const { data: authData } = await api.post('/auth/google-supabase', {
          accessToken: session.access_token,
          role: pendingRole,
        })

        if (!mounted) return;

        setAuth(authData.user, authData.token)
        toast.success(authData.isNew ? '🎉 Account created!' : 'Welcome back!')

        const next = params.get('next')
        if (next) return navigate(next)
        
        if (authData.user.role === 'ADMIN') navigate('/admin/dashboard')
        else if (authData.user.role === 'OWNER') navigate('/owner/dashboard')
        else navigate('/tenant/dashboard')

      } catch (err: any) {
        console.error('Auth callback error:', err)
        if (mounted) {
          setError(err.message || 'Authentication failed')
          setTimeout(() => navigate('/login'), 3000)
        }
      }
    }

    const handleCallback = async () => {
      try {
        // First check if session is already established
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (session) {
          return processSession(session)
        }

        // If not, wait for Supabase to automatically process the URL parameters
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
          if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
            processSession(session)
          } else if (event === 'SIGNED_OUT') {
            setError('Authentication was cancelled.')
          }
        })
        authListener = listener;

      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to initialize session')
      }
    }

    handleCallback()

    return () => {
      mounted = false;
      if (authListener) authListener.subscription.unsubscribe();
    }
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Authentication Failed</h2>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <p className="text-slate-400 text-xs">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={40} className="animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-slate-800">Signing you in...</h2>
        <p className="text-slate-500 text-sm mt-1">Please wait, setting up your account</p>
      </div>
    </div>
  )
}
