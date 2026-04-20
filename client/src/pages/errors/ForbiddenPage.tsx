import { Link } from 'react-router-dom'
export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-center px-4">
      <div className="animate-fade-in">
        <div className="text-8xl font-black text-white/10 mb-4">403</div>
        <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-slate-400 mb-8">You don't have permission to view this page.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary">← Go Home</Link>
          <Link to="/login" className="btn-outline border-slate-500 text-slate-300 hover:bg-slate-700">Sign In</Link>
        </div>
      </div>
    </div>
  )
}
