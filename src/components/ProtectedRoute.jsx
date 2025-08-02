import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function ProtectedRoute({ children, requireSubscription = false }) {
  const { isAuthenticated, subscription, isLoading } = useAuthStore()
  const location = useLocation()

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-8 h-8 border-4"></div>
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

