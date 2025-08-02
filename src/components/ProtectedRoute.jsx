import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ children, requireSubscription = false }) {
  const { isAuthenticated, isLoading, isInitialized, subscription, hasActiveSubscription } = useAuth()
  const location = useLocation()

  // Show loading while auth is being initialized
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check subscription requirement
  if (requireSubscription && !hasActiveSubscription()) {
    return <Navigate to="/pricing" state={{ from: location }} replace />
  }

  return children
}

