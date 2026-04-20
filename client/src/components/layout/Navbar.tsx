import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { signOut } from '@/lib/supabase'
import NotificationBell from '@/components/layout/NotificationBell'
import { Home, Menu, X, LogOut, User } from 'lucide-react'

const tenantLinks = [
  { to: '/tenant/dashboard',    label: 'Dashboard' },
  { to: '/tenant/search',       label: 'Search' },
  { to: '/tenant/applications', label: 'Applications' },
  { to: '/tenant/saved',        label: 'Saved' },
  { to: '/tenant/agreements',   label: 'Agreements' },
]
const ownerLinks = [
  { to: '/owner/dashboard',    label: 'Dashboard' },
  { to: '/owner/properties',   label: 'My Listings' },
  { to: '/owner/applications', label: 'Applications' },
  { to: '/owner/agreements',   label: 'Agreements' },
]
const adminLinks = [
  { to: '/admin/dashboard',    label: 'Dashboard' },
  { to: '/admin/users',        label: 'Users' },
  { to: '/admin/properties',   label: 'Properties' },
  { to: '/admin/applications', label: 'Applications' },
  { to: '/admin/logs',         label: 'Audit Logs' },
]

const roleColor: Record<string, string> = {
  TENANT: 'text-tenant',
  OWNER:  'text-owner',
  ADMIN:  'text-admin',
}

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    logout()
    navigate('/login')
  }

  const links = user?.role === 'TENANT' ? tenantLinks
    : user?.role === 'OWNER' ? ownerLinks
    : user?.role === 'ADMIN' ? adminLinks : []

  return (
    <nav className="glass sticky top-0 z-50 border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary shrink-0">
          <Home size={22} className="text-primary" />
          <span>RentEase</span>
        </Link>

        {/* Desktop nav links */}
        {user && (
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith(l.to)
                    ? 'bg-primary-50 text-primary'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}>{l.label}</Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {!user && (
            <>
              <Link to="/properties" className="text-sm text-slate-600 hover:text-primary font-medium hidden md:block">Browse</Link>
              <Link to="/login" className="btn-primary text-sm py-1.5">Sign In</Link>
            </>
          )}
          {user && (
            <>
              <NotificationBell />
              <div className="flex items-center gap-2 cursor-pointer group relative" onClick={() => navigate(`/${user.role.toLowerCase()}/profile`)}>
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full ring-2 ring-primary/20" />
                  : <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">{user.name[0]}</div>
                }
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-slate-800 leading-none">{user.name.split(' ')[0]}</p>
                  <p className={`text-xs font-medium ${roleColor[user.role]}`}>{user.role}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="hidden md:flex items-center gap-1 text-slate-500 hover:text-red-500 transition-colors text-sm">
                <LogOut size={16} />
              </button>
            </>
          )}
          <button className="md:hidden text-slate-600" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 px-4 py-3 space-y-1 animate-slide-down bg-white">
          {user ? links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">{l.label}</Link>
          )) : (
            <Link to="/login" onClick={() => setOpen(false)} className="block btn-primary text-center text-sm">Sign In</Link>
          )}
          {user && <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg">Sign Out</button>}
        </div>
      )}
    </nav>
  )
}
