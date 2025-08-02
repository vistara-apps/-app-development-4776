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
    
    // New auth methods
    signUp: store.signUp,
    signIn: store.signIn,
    signOut: store.signOut,
    
    // Legacy auth methods (for backward compatibility)
    login: store.login,
    register: store.register,
    logout: store.logout,
    
    // Profile methods
    updateProfile: store.updateProfile,
    setBodyMeasurements: store.setBodyMeasurements,
    setSubscription: store.setSubscription,
    
    // Subscription helpers
    hasActiveSubscription: store.hasActiveSubscription,
    getSubscriptionFeatures: store.getSubscriptionFeatures
  }
}

export default useAuth
