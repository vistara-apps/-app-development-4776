import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from './LoadingSpinner'
import useAuthStore from '../store/authStore'

export default function ProtectedRoute({ children, requireSubscription = false }) {
  const { isAuthenticated, isLoading, subscription } = useAuth()
  const location = useLocation()

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check subscription requirement
  if (requireSubscription && (!subscription || !subscription.active)) {
    return <Navigate to="/pricing" state={{ from: location }} replace />
  }

  return children
}

