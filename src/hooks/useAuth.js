import { useEffect } from 'react'
import useAuthStore from '../store/authStore'
import { auth } from '../lib/supabase'

export const useAuth = () => {
  const authStore = useAuthStore()

  useEffect(() => {
    // Initialize auth state on mount
    authStore.initialize()

    // Listen for auth state changes
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        authStore.login({
          ...session.user,
          subscription: { plan: 'basic', active: true } // Mock subscription
        })
      } else if (event === 'SIGNED_OUT') {
        authStore.logout()
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  return authStore
}

export default useAuth

