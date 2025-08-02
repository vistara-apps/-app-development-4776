import { create } from 'zustand'
import { supabase, authHelpers, getCurrentUser, getUserProfile, getSubscriptionStatus, updateUserProfile } from '../lib/supabase'
import { toast } from 'react-hot-toast'

// Import services with fallback for backward compatibility
let userService, subscriptionService
try {
  const userServiceModule = await import('../services/userService')
  userService = userServiceModule.userService
} catch {
  // Use legacy functions if services don't exist
  userService = {
    getProfile: getUserProfile,
    updateProfile: async (userId, updates) => {
      return { data: await updateUserProfile(userId, updates) }
    },
    createProfile: async (userId, profileData) => {
      return { data: await updateUserProfile(userId, profileData) }
    },
    setBodyMeasurements: async (userId, measurements) => {
      return { data: await updateUserProfile(userId, { body_measurements: measurements }) }
    }
  }
}

try {
  const subscriptionServiceModule = await import('../services/subscriptionService')
  subscriptionService = subscriptionServiceModule.subscriptionService
} catch {
  // Use legacy functions if services don't exist
  subscriptionService = {
    getSubscription: getSubscriptionStatus,
    getSubscriptionFeatures: (plan) => {
      const features = {
        free: { try_on_limit: 3, wardrobe_items: 10 },
        basic: { try_on_limit: 50, wardrobe_items: 100 },
        premium: { try_on_limit: -1, wardrobe_items: -1 }
      }
      return features[plan] || features.free
    }
  }
}

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  subscription: null,
  bodyMeasurements: null,
  isLoading: false,
  isInitialized: false,
  
  // Initialize auth state from Supabase session
  initialize: async () => {
    try {
      set({ isLoading: true })
      
      const { session, error } = await authHelpers.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        set({ isInitialized: true, isLoading: false })
        return
      }

      if (session?.user) {
        await get().setUser(session.user)
      }
      
      set({ isInitialized: true, isLoading: false })
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({ isInitialized: true, isLoading: false })
    }
  },

  // Set user and load associated data
  setUser: async (user) => {
    try {
      set({ user, isAuthenticated: !!user, isLoading: true })
      
      if (user) {
        // Load user profile
        const profile = await userService.getProfile(user.id)
        const profileData = profile?.data || profile
        
        // Load subscription
        const subscription = await subscriptionService.getSubscription(user.id)
        const subscriptionData = subscription?.data || subscription
        
        set({ 
          profile: profileData,
          subscription: subscriptionData,
          bodyMeasurements: profileData?.body_measurements || null,
          isLoading: false
        })
      } else {
        set({ 
          profile: null,
          subscription: null,
          bodyMeasurements: null,
          isLoading: false
        })
      }
    } catch (error) {
      console.error('Error setting user:', error)
      set({ isLoading: false })
    }
  },
  
  // Legacy method for backward compatibility
  setUserFromSession: async (user) => {
    await get().setUser(user)
  },

  // Sign up with email and password
  signUp: async (email, password, userData = {}) => {
    try {
      set({ isLoading: true })
      
      const { data, error } = await authHelpers.signUp(email, password, userData)
      
      if (error) {
        toast.error(error.message)
        set({ isLoading: false })
        return { success: false, error }
      }

      if (data.user) {
        // Create user profile
        await userService.createProfile(data.user.id, {
          email: data.user.email,
          full_name: userData.full_name || '',
          avatar_url: userData.avatar_url || null
        })
        
        toast.success('Account created successfully! Please check your email to verify your account.')
      }
      
      set({ isLoading: false })
      return { success: true, data }
    } catch (error) {
      console.error('Error signing up:', error)
      toast.error('Failed to create account')
      set({ isLoading: false })
      return { success: false, error }
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      set({ isLoading: true })
      
      const { data, error } = await authHelpers.signIn(email, password)
      
      if (error) {
        toast.error(error.message)
        set({ isLoading: false })
        return { success: false, error }
      }

      if (data.user) {
        await get().setUser(data.user)
        toast.success('Welcome back!')
      }
      
      set({ isLoading: false })
      return { success: true, data }
    } catch (error) {
      console.error('Error signing in:', error)
      toast.error('Failed to sign in')
      set({ isLoading: false })
      return { success: false, error }
    }
  },

  // Sign out
  signOut: async () => {
    try {
      set({ isLoading: true })
      
      const { error } = await authHelpers.signOut()
      
      if (error) {
        toast.error(error.message)
        set({ isLoading: false })
        return { success: false, error }
      }

      set({ 
        user: null, 
        profile: null,
        isAuthenticated: false, 
        subscription: null,
        bodyMeasurements: null,
        isLoading: false
      })
      
      toast.success('Signed out successfully')
      return { success: true }
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
      set({ isLoading: false })
      return { success: false, error }
    }
  },
  
  // Legacy methods for backward compatibility
  login: async (email, password) => {
    const result = await get().signIn(email, password)
    if (result.success) {
      return result.data
    } else {
      throw new Error(result.error?.message || 'Login failed')
    }
  },
  
  register: async (email, password, fullName) => {
    const result = await get().signUp(email, password, { full_name: fullName })
    if (result.success) {
      return result.data
    } else {
      throw new Error(result.error?.message || 'Registration failed')
    }
  },
  
  logout: async () => {
    await get().signOut()
  },
  
  // Update user profile
  updateProfile: async (updates) => {
    try {
      const { user } = get()
      if (!user) return { success: false, error: 'Not authenticated' }

      set({ isLoading: true })
      
      const { data, error } = await userService.updateProfile(user.id, updates)
      
      if (error) {
        toast.error('Failed to update profile')
        set({ isLoading: false })
        return { success: false, error }
      }

      const profileData = data?.data || data
      set({ 
        profile: profileData,
        bodyMeasurements: profileData?.body_measurements || null,
        isLoading: false
      })
      
      toast.success('Profile updated successfully')
      return { success: true, data: profileData }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
      set({ isLoading: false })
      return { success: false, error }
    }
  },
  
  // Set body measurements
  setBodyMeasurements: async (measurements) => {
    try {
      const { user } = get()
      if (!user) return { success: false, error: 'Not authenticated' }

      const { data, error } = await userService.setBodyMeasurements(user.id, measurements)
      
      if (error) {
        toast.error('Failed to save measurements')
        return { success: false, error }
      }

      const profileData = data?.data || data
      set({ 
        bodyMeasurements: measurements,
        profile: profileData
      })
      
      toast.success('Measurements saved successfully')
      return { success: true, data: profileData }
    } catch (error) {
      console.error('Error setting measurements:', error)
      toast.error('Failed to save measurements')
      return { success: false, error }
    }
  },
  
  // Update subscription
  setSubscription: (subscription) => set({ subscription }),

  // Check if user has active subscription
  hasActiveSubscription: () => {
    const { subscription } = get()
    if (!subscription) return false
    
    const now = new Date()
    const expiresAt = new Date(subscription.expires_at)
    
    return subscription.active && expiresAt > now
  },

  // Get subscription features
  getSubscriptionFeatures: () => {
    const { subscription } = get()
    const plan = subscription?.plan || 'free'
    return subscriptionService.getSubscriptionFeatures(plan)
  }
}))

// Set up auth state listener
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useAuthStore.getState()
  
  if (event === 'SIGNED_IN' && session?.user) {
    await store.setUser(session.user)
  } else if (event === 'SIGNED_OUT') {
    store.setUser(null)
  } else if (event === 'TOKEN_REFRESHED' && session?.user) {
    await store.setUser(session.user)
  }
})

export default useAuthStore