import { Link } from 'react-router-dom'
export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-center px-4">
      <div className="animate-fade-in">
        <div className="text-8xl font-black text-white/10 mb-4">404</div>
        <h1 className="text-3xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-slate-400 mb-8">The page you're looking for doesn't exist or was moved.</p>
        <Link to="/" className="btn-primary inline-block">← Go Home</Link>
      </div>
    </div>
  )
}
