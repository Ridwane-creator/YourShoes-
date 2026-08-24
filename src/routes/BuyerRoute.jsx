import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function BuyerRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="font-mono text-sm text-concrete">Chargement…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
