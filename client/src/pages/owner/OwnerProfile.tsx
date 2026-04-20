import { useState, useRef } from 'react'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import ProfileForm from '@/components/profile/ProfileForm'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { signOut } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { LogOut } from 'lucide-react'

export default function OwnerProfile() {
  const { user, logout, setAuth } = useAuthStore()
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogout = async () => { await signOut(); logout(); navigate('/login'); toast.success('Signed out') }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    const file = e.target.files[0]
    
    setUploading(true)
    const formData = new FormData()
    formData.append('avatar', file)
    
    try {
      const { data } = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const token = localStorage.getItem('rentease-auth')
      if (token) {
        const parsed = JSON.parse(token)
        setAuth(data.user, parsed.state?.token || '')
      }
      toast.success('Profile picture updated!')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to upload photo')
    }
    setUploading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-8 animate-fade-in">
        <h1 className="page-header mb-6">My Profile</h1>
        <div className="card p-6 text-center mb-4">
          <div 
            className="relative inline-block cursor-pointer group"
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} className={`w-20 h-20 rounded-full mx-auto mb-3 ring-4 ring-owner/20 object-cover ${uploading ? 'opacity-50' : 'group-hover:opacity-80 transition-opacity'}`} />
              : <div className={`w-20 h-20 rounded-full bg-owner flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3 ${uploading ? 'opacity-50' : 'group-hover:opacity-80 transition-opacity'}`}>{user?.name[0]}</div>
            }
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pb-3">
              <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-md">Edit</span>
            </div>
            <input type="file" hidden accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <span className="badge bg-owner-50 text-owner mt-2">OWNER</span>
        </div>
        <ProfileForm />
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors font-medium">
          <LogOut size={17} /> Sign Out
        </button>
      </div>
    </div>
  )
}
