import { createContext, useContext, useEffect } from 'react'
import { auth } from '../lib/supabase'
import useAuthStore from '../store/authStore'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const { initialize, initialized, user, isAuthenticated, loading } = useAuthStore()

  useEffect(() => {
    // Initialize auth state on app load
    initialize()

    // Listen for auth state changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Re-initialize to get updated user data
        await initialize()
      } else if (event === 'SIGNED_OUT') {
        // Clear auth state
        useAuthStore.setState({
          user: null,
          isAuthenticated: false,
          subscription: null,
          bodyMeasurements: null
        })
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Re-initialize to ensure we have the latest data
        await initialize()
      }
    })

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe()
    }
  }, [initialize])

  const value = {
    user,
    isAuthenticated,
    loading,
    initialized
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
