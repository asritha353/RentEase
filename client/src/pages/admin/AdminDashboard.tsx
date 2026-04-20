import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { Users, Home, FileText, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#1A56DB','#0E9F6E','#FF5A1F','#7E3AF2','#F59E0B']

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {})
  }, [])

  if (!stats) return (
    <div className="min-h-screen"><Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">{Array(4).fill(0).map((_,i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      </div>
    </div>
  )

  const kpis = [
    { icon: Users,     label: 'Total Users',       value: stats.users,       color: 'bg-primary-50 text-primary' },
    { icon: Home,      label: 'Properties',         value: stats.properties,  color: 'bg-owner-50 text-owner' },
    { icon: FileText,  label: 'Applications',       value: stats.applications,color: 'bg-amber-50 text-amber-600' },
    { icon: TrendingUp,label: 'Agreements Issued',  value: stats.agreements,  color: 'bg-admin-50 text-admin' },
  ]

  const roleData = (stats.byRole || []).map((r: any) => ({ name: r.role, value: r._count }))
  const propData = (stats.byPropStatus || []).map((r: any) => ({ name: r.status.replace('_',' '), value: r._count }))
  const appData  = (stats.byAppStatus  || []).map((r: any) => ({ name: r.status, value: r._count }))

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
        <h1 className="page-header mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {kpis.map(k => (
            <div key={k.label} className="card p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${k.color}`}><k.icon size={20}/></div>
              <div className="text-2xl font-bold text-slate-900">{k.value}</div>
              <div className="text-sm text-slate-500">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Users by Role</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={roleData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {roleData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Properties by Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={propData}><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis /><Tooltip />
                <Bar dataKey="value" fill="#1A56DB" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Applications by Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={appData}><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis /><Tooltip />
                <Bar dataKey="value" fill="#0E9F6E" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
