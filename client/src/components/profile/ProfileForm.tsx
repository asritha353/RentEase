import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Edit2, Save, X } from 'lucide-react'

export default function ProfileForm() {
  const { user, setAuth } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [form, setForm] = useState({
    phone: user?.phone || '',
    occupation: user?.occupation || '',
    company: user?.company || '',
    about: user?.about || ''
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.patch('/auth/profile', form)
      // We don't have the token in the response, so we just pass the existing token
      // We just need to update the user object in the store
      const token = localStorage.getItem('rentease-auth')
      if (token) {
        const parsed = JSON.parse(token)
        setAuth(data.user, parsed.state?.token || '')
      }
      toast.success('Profile updated!')
      setEditing(false)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update profile')
    }
    setSaving(false)
  }

  if (!editing) {
    return (
      <div className="card p-6 mb-4 relative">
        <button onClick={() => setEditing(true)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-primary transition-colors bg-slate-50 hover:bg-primary-50 rounded-lg">
          <Edit2 size={16} />
        </button>
        <h3 className="font-bold text-slate-800 mb-4">Personal Details</h3>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone Number</p>
            <p className="text-sm text-slate-900 font-medium">{user?.phone || <span className="text-slate-400 italic">Not provided</span>}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Occupation</p>
            <p className="text-sm text-slate-900 font-medium">{user?.occupation || <span className="text-slate-400 italic">Not provided</span>}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Company / Employer</p>
            <p className="text-sm text-slate-900 font-medium">{user?.company || <span className="text-slate-400 italic">Not provided</span>}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">About Me</p>
            <p className="text-sm text-slate-900">{user?.about || <span className="text-slate-400 italic">No bio provided</span>}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6 mb-4 border-primary/20 ring-4 ring-primary/5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800">Edit Details</h3>
        <button onClick={() => setEditing(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 rounded-lg">
          <X size={16} />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Phone Number</label>
          <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input py-2 text-sm" placeholder="+91 9876543210" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Occupation</label>
          <input value={form.occupation} onChange={e => setForm({...form, occupation: e.target.value})} className="input py-2 text-sm" placeholder="Software Engineer" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Company / Employer</label>
          <input value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="input py-2 text-sm" placeholder="Google" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">About Me</label>
          <textarea value={form.about} onChange={e => setForm({...form, about: e.target.value})} className="input py-2 text-sm resize-none h-24" placeholder="I am a quiet and responsible tenant..." />
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-2.5 flex justify-center items-center gap-2">
          <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
