import { create } from 'zustand'
import { AuthService } from '../services/auth'

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  isAuthenticated: false,
  subscription: null,
  bodyMeasurements: null,
  isLoading: false,
  isInitialized: false,
  
  // Initialize auth state from Supabase session
  initialize: async () => {
    set({ isLoading: true })
    
    try {
      const sessionData = await AuthService.getCurrentSession()
      
      if (sessionData) {
        set({
          user: sessionData.user,
          profile: sessionData.profile,
          session: sessionData.session,
          subscription: sessionData.subscription,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true
        })
      } else {
        set({
          user: null,
          profile: null,
          session: null,
          subscription: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true
        })
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({
        user: null,
        profile: null,
        session: null,
        subscription: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true
      })
    }
  },
  
  // Login with email and password
  login: async (email, password) => {
    set({ isLoading: true })
    
    try {
      const { user, session, profile, subscription } = await AuthService.signIn(email, password)
      
      set({
        user,
        profile,
        session,
        subscription,
        isAuthenticated: true,
        isLoading: false
      })
      
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.message }
    }
  },
  
  // Register new user
  register: async (email, password, userData = {}) => {
    set({ isLoading: true })
    
    try {
      const { user, session } = await AuthService.signUp(email, password, userData)
      
      set({
        user,
        session,
        isAuthenticated: !!user,
        isLoading: false
      })
      
      return { success: true, user }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.message }
    }
  },
  
  // Logout
  logout: async () => {
    set({ isLoading: true })
    
    try {
      await AuthService.signOut()
      
      set({
        user: null,
        profile: null,
        session: null,
        subscription: null,
        bodyMeasurements: null,
        isAuthenticated: false,
        isLoading: false
      })
      
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.message }
    }
  },
  
  // Update user profile
  updateProfile: async (updates) => {
    const { user, profile } = get()
    if (!user) return { success: false, error: 'Not authenticated' }
    
    set({ isLoading: true })
    
    try {
      const updatedProfile = await AuthService.updateProfile(user.id, updates)
      
      set({
        profile: updatedProfile,
        user: { ...user, ...updates },
        isLoading: false
      })
      
      return { success: true, profile: updatedProfile }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.message }
    }
  },
  
  // Set body measurements
  setBodyMeasurements: (measurements) => set({ bodyMeasurements: measurements }),
  
  // Update subscription status
  setSubscription: (subscription) => set({ subscription }),
  
  // Reset password
  resetPassword: async (email) => {
    try {
      await AuthService.resetPassword(email)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },
  
  // Update password
  updatePassword: async (newPassword) => {
    try {
      await AuthService.updatePassword(newPassword)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },
  
  // Check if user has active subscription
  hasActiveSubscription: () => {
    const { subscription } = get()
    return subscription?.isActive || false
  },
  
  // Get subscription plan
  getSubscriptionPlan: () => {
    const { subscription } = get()
    return subscription?.subscription_plan || 'free'
  }
}))

export default useAuthStore
