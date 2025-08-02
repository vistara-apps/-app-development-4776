import { create } from 'zustand'
import { auth } from '../lib/supabase'
import { toast } from 'react-hot-toast'

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  subscription: null,
  bodyMeasurements: null,
  isLoading: false,
  
  // Initialize auth state from Supabase session
  initialize: async () => {
    set({ isLoading: true })
    try {
      const { session, error } = await auth.getSession()
      if (error) throw error
      
      if (session?.user) {
        set({ 
          user: session.user, 
          isAuthenticated: true,
          subscription: { plan: 'basic', active: true } // Mock subscription for now
        })
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      toast.error('Failed to initialize authentication')
    } finally {
      set({ isLoading: false })
    }
  },
  
  // Sign up with email and password
  signUp: async (email, password, userData = {}) => {
    set({ isLoading: true })
    try {
      const { data, error } = await auth.signUp(email, password, userData)
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
      const { data, error } = await auth.signIn(email, password)
      if (error) throw error
      
      if (data.user) {
        set({ 
          user: data.user, 
          isAuthenticated: true,
          subscription: { plan: 'basic', active: true } // Mock subscription for now
        })
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
      const { error } = await auth.signOut()
      if (error) throw error
      
      set({ 
        user: null, 
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
  login: (user) => set({ 
    user, 
    isAuthenticated: true,
    subscription: user.subscription || null 
  }),
  
  // Legacy logout method for backward compatibility
  logout: () => set({ 
    user: null, 
    isAuthenticated: false, 
    subscription: null,
    bodyMeasurements: null 
  }),
  
  updateProfile: (updates) => set((state) => ({
    user: { ...state.user, ...updates }
  })),
  
  setBodyMeasurements: (measurements) => set({ bodyMeasurements: measurements }),
  
  setSubscription: (subscription) => set({ subscription }),
  
  // Reset password
  resetPassword: async (email) => {
    set({ isLoading: true })
    try {
      const { data, error } = await auth.resetPassword(email)
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

export default useAuthStore
