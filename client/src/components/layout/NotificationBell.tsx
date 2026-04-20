import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/lib/utils'

export default function NotificationBell() {
  const { user } = useAuthStore()
  const [notifs, setNotifs] = useState<any[]>([])
  const [open, setOpen] = useState(false)

  const unread = notifs.filter(n => !n.isRead).length

  useEffect(() => {
    if (!user) return
    api.get('/notifications').then(r => setNotifs(r.data.notifications)).catch(() => {})
    const interval = setInterval(() => {
      api.get('/notifications').then(r => setNotifs(r.data.notifications)).catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [user])

  const markAllRead = async () => {
    await api.patch('/notifications/read-all')
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  if (!user) return null

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
        <Bell size={18} className="text-slate-600" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-tenant text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-slide-down z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="font-semibold text-slate-800 text-sm">Notifications</span>
            {unread > 0 && <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
            {notifs.length === 0 && <p className="text-center text-slate-400 text-sm py-8">No notifications</p>}
            {notifs.map(n => (
              <div key={n.id} className={`px-4 py-3 ${n.isRead ? '' : 'bg-primary-50/40'}`}>
                <p className="text-sm font-medium text-slate-800">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-slate-400 mt-1">{formatDate(n.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  )
}
