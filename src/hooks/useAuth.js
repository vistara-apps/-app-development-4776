import { useEffect } from 'react'
import useAuthStore from '../store/authStore'

export const useAuth = () => {
  const store = useAuthStore()

  useEffect(() => {
    // Initialize auth state on mount
    if (!store.isInitialized) {
      store.initialize()
    }
  }, [store.isInitialized])

  return {
    // Auth state
    user: store.user,
    profile: store.profile,
    isAuthenticated: store.isAuthenticated,
    subscription: store.subscription,
    bodyMeasurements: store.bodyMeasurements,
    isLoading: store.isLoading,
    isInitialized: store.isInitialized,
    
    // Auth methods
    signUp: store.signUp,
    signIn: store.signIn,
    signOut: store.signOut,
    updateProfile: store.updateProfile,
    setBodyMeasurements: store.setBodyMeasurements,
    
    // Subscription helpers
    hasActiveSubscription: store.hasActiveSubscription,
    getSubscriptionFeatures: store.getSubscriptionFeatures
  }
}

