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
        subscription: null
      })
    }
  },
  
  // Login with email and password
  login: async (email, password) => {
    set({ isLoading: true })
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        throw error
      }
      
      if (data.user) {
        await get().setUserFromSession(data.user)
        toast.success('Welcome back!')
        return { success: true }
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.message || 'Failed to sign in')
      return { success: false, error: error.message }
    } finally {
      set({ isLoading: false })
    }
  },
  
  // Register new user
  register: async (email, password, userData = {}) => {
    set({ isLoading: true })
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (error) {
        throw error
      }
      
      if (data.user) {
        toast.success('Registration successful! Please check your email to verify your account.')
        return { success: true }
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error.message || 'Failed to create account')
      return { success: false, error: error.message }
    } finally {
      set({ isLoading: false })
    }
  },
  
  // Logout
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      set({ 
        user: null,
        profile: null,
        isAuthenticated: false, 
        subscription: null,
        bodyMeasurements: null 
      })
      
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to sign out')
    }
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
  setSubscription: (subscription) => set({ subscription })
}))

// Set up auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useAuthStore.getState()
  
  if (event === 'SIGNED_IN' && session?.user) {
    await store.setUserFromSession(session.user)
  } else if (event === 'SIGNED_OUT') {
    store.logout()
  } else if (event === 'TOKEN_REFRESHED' && session?.user) {
    await store.setUserFromSession(session.user)
  }
})

export default useAuthStore
