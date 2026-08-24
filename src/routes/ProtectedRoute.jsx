import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <p className="font-mono text-sm text-concrete-light">Chargement…</p>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
