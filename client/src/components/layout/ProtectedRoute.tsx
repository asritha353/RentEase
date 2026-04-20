import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface Props { role: 'TENANT' | 'OWNER' | 'ADMIN' }

export default function ProtectedRoute({ role }: Props) {
  const { user, token } = useAuthStore()
  if (!token || !user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to="/403" replace />
  return <Outlet />
}
