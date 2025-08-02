import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ children, requireSubscription = false }) {
  const { isAuthenticated, isLoading, subscription } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireSubscription && !subscription?.active) {
    // Redirect to pricing page if subscription is required
    return <Navigate to="/pricing" state={{ from: location }} replace />
  }

  return children
}

