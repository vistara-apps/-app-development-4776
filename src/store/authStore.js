import { create } from 'zustand'
import { supabase, getCurrentUser, getUserProfile, getSubscriptionStatus } from '../lib/supabase'
import { toast } from 'react-hot-toast'

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  subscription: null,
  bodyMeasurements: null,
  isLoading: false,
  
  // Initialize auth state from Supabase session
  initialize: async () => {
    set({ isLoading: true })
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        await get().setUserFromSession(session.user)
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  
  // Set user data from Supabase session
  setUserFromSession: async (user) => {
    try {
      // Get user profile
      const profile = await getUserProfile(user.id)
      
      // Get subscription status
      const subscription = await getSubscriptionStatus(user.id)
      
      set({ 
        user,
        profile,
        isAuthenticated: true,
        subscription
      })
    } catch (error) {
      console.error('Error setting user from session:', error)
      set({ 
        user,
        profile: null,
        isAuthenticated: true,
        subscription: { plan: 'basic', active: true } // Mock subscription fallback
      })
    }
  },
  
  // Sign up with email and password
  signUp: async (email, password, userData = {}) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (error) throw error
      
      if (data.user) {
        toast.success('Account created! Please check your email to verify your account.')
        return { success: true, data }
      }
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error(error.message || 'Failed to create account')
      return { success: false, error }
    } finally {
      set({ isLoading: false })
    }
  },
  
  // Sign in with email and password
  signIn: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      if (data.user) {
        await get().setUserFromSession(data.user)
        toast.success('Welcome back!')
        return { success: true, data }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error(error.message || 'Failed to sign in')
      return { success: false, error }
    } finally {
      set({ isLoading: false })
    }
  },
  
  // Sign out
  signOut: async () => {
    set({ isLoading: true })
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      set({ 
        user: null,
        profile: null,
        isAuthenticated: false, 
        subscription: null,
        bodyMeasurements: null 
      })
      toast.success('Signed out successfully')
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
      return { success: false, error }
    } finally {
      set({ isLoading: false })
    }
  },
  
  // Legacy login method for backward compatibility
  login: async (email, password) => {
    return await get().signIn(email, password)
  },
  
  // Legacy logout method for backward compatibility
  logout: async () => {
    return await get().signOut()
  },
  
  // Register method for backward compatibility
  register: async (email, password, userData = {}) => {
    return await get().signUp(email, password, userData)
  },
  
  // Update user profile
  updateProfile: async (updates) => {
    const { user } = get()
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      set((state) => ({
        profile: { ...state.profile, ...data }
      }))
      
      toast.success('Profile updated successfully')
      return { success: true }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile')
      return { success: false, error: error.message }
    }
  },
  
  // Set body measurements
  setBodyMeasurements: (measurements) => set({ bodyMeasurements: measurements }),
  
  // Refresh subscription status
  refreshSubscription: async () => {
    const { user } = get()
    if (!user) return
    
    try {
      const subscription = await getSubscriptionStatus(user.id)
      set({ subscription })
    } catch (error) {
      console.error('Error refreshing subscription:', error)
    }
  },
  
  // Set subscription
  setSubscription: (subscription) => set({ subscription }),
  
  // Reset password
  resetPassword: async (email) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.resetPassword({
        email,
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw error
      
      toast.success('Password reset email sent!')
      return { success: true, data }
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error(error.message || 'Failed to send reset email')
      return { success: false, error }
    } finally {
      set({ isLoading: false })
    }
  }
}))

// Set up auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useAuthStore.getState()
  
  if (event === 'SIGNED_IN' && session?.user) {
    await store.setUserFromSession(session.user)
  } else if (event === 'SIGNED_OUT') {
    await store.signOut()
  } else if (event === 'TOKEN_REFRESHED' && session?.user) {
    await store.setUserFromSession(session.user)
  }
})

export default useAuthStore

