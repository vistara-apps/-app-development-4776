import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/authStore'

export const useAuth = () => {
  const { 
    user, 
    profile, 
    isAuthenticated, 
    isLoading, 
    subscription,
    bodyMeasurements,
    initialize, 
    setUser, 
    login, 
    register, 
    logout, 
    updateProfile, 
    setBodyMeasurements, 
    setSubscription 
  } = useAuthStore()

  useEffect(() => {
    // Initialize auth state
    initialize()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            await setUser(session.user)
          }
        } else if (event === 'SIGNED_OUT') {
          await setUser(null)
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [initialize, setUser])

  return {
    user,
    profile,
    isAuthenticated,
    isLoading,
    subscription,
    bodyMeasurements,
    login,
    register,
    logout,
    updateProfile,
    setBodyMeasurements,
    setSubscription
  }
}

export default useAuth
