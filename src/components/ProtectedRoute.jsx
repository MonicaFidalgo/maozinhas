import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../App'

export default function ProtectedRoute() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--mid)', fontSize: '.95rem' }}>
        A verificar acesso…
      </div>
    )
  }

  if (!session) return <Navigate to="/admin/login" replace />

  return <Outlet />
}
