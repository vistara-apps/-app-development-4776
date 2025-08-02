import { create } from 'zustand'
import { auth, db } from '../lib/supabase'
import { toast } from 'react-hot-toast'

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  subscription: null,
  bodyMeasurements: null,
  loading: false,
  initialized: false,
  
  // Initialize auth state from Supabase session
  initialize: async () => {
    try {
      const { session, error } = await auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        set({ initialized: true })
        return
      }

      if (session?.user) {
        // Get user profile from database
        const { data: profile, error: profileError } = await db.getUserProfile(session.user.id)
        
        const userData = {
          id: session.user.id,
          email: session.user.email,
          name: profile?.name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
          avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url,
          ...profile
        }

        set({ 
          user: userData,
          isAuthenticated: true,
          subscription: profile?.subscription || null,
          bodyMeasurements: profile?.body_measurements || null,
          initialized: true
        })
      } else {
        set({ 
          user: null,
          isAuthenticated: false,
          subscription: null,
          bodyMeasurements: null,
          initialized: true
        })
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({ initialized: true })
    }
  },

  // Sign up with email and password
  signUp: async (email, password, userData = {}) => {
    set({ loading: true })
    
    try {
      const { data, error } = await auth.signUp(email, password, userData)
      
      if (error) {
        toast.error(error.message)
        return { success: false, error }
      }

      if (data.user) {
        // Create user profile in database
        const profileData = {
          id: data.user.id,
          email: data.user.email,
          name: userData.name || data.user.email?.split('@')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { error: profileError } = await db.createUserProfile(profileData)
        
        if (profileError) {
          console.error('Error creating profile:', profileError)
        }

        toast.success('Account created successfully! Please check your email to verify your account.')
        return { success: true, data }
      }
    } catch (error) {
      console.error('Signup error:', error)
      toast.error('An unexpected error occurred')
      return { success: false, error }
    } finally {
      set({ loading: false })
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    set({ loading: true })
    
    try {
      const { data, error } = await auth.signIn(email, password)
      
      if (error) {
        toast.error(error.message)
        return { success: false, error }
      }

      if (data.user) {
        // Get user profile from database
        const { data: profile, error: profileError } = await db.getUserProfile(data.user.id)
        
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: profile?.name || data.user.user_metadata?.name || data.user.email?.split('@')[0],
          avatar_url: profile?.avatar_url || data.user.user_metadata?.avatar_url,
          ...profile
        }

        set({ 
          user: userData,
          isAuthenticated: true,
          subscription: profile?.subscription || null,
          bodyMeasurements: profile?.body_measurements || null
        })

        toast.success('Welcome back!')
        return { success: true, data }
      }
    } catch (error) {
      console.error('Signin error:', error)
      toast.error('An unexpected error occurred')
      return { success: false, error }
    } finally {
      set({ loading: false })
    }
  },

  // Sign out
  signOut: async () => {
    set({ loading: true })
    
    try {
      const { error } = await auth.signOut()
      
      if (error) {
        toast.error(error.message)
        return { success: false, error }
      }

      set({ 
        user: null, 
        isAuthenticated: false, 
        subscription: null,
        bodyMeasurements: null
      })

      toast.success('Signed out successfully')
      return { success: true }
    } catch (error) {
      console.error('Signout error:', error)
      toast.error('An unexpected error occurred')
      return { success: false, error }
    } finally {
      set({ loading: false })
    }
  },

  // Update user profile
  updateProfile: async (updates) => {
    const { user } = get()
    if (!user) return { success: false, error: 'No user logged in' }

    set({ loading: true })
    
    try {
      const { data, error } = await db.updateUserProfile(user.id, {
        ...updates,
        updated_at: new Date().toISOString()
      })
      
      if (error) {
        toast.error('Failed to update profile')
        return { success: false, error }
      }

      set((state) => ({
        user: { ...state.user, ...data }
      }))

      toast.success('Profile updated successfully')
      return { success: true, data }
    } catch (error) {
      console.error('Update profile error:', error)
      toast.error('An unexpected error occurred')
      return { success: false, error }
    } finally {
      set({ loading: false })
    }
  },
  
  // Set body measurements
  setBodyMeasurements: async (measurements) => {
    const { user } = get()
    if (!user) return { success: false, error: 'No user logged in' }

    try {
      const { data, error } = await db.updateUserProfile(user.id, {
        body_measurements: measurements,
        updated_at: new Date().toISOString()
      })
      
      if (error) {
        toast.error('Failed to save measurements')
        return { success: false, error }
      }

      set({ bodyMeasurements: measurements })
      toast.success('Measurements saved successfully')
      return { success: true, data }
    } catch (error) {
      console.error('Set measurements error:', error)
      toast.error('An unexpected error occurred')
      return { success: false, error }
    }
  },
  
  // Set subscription
  setSubscription: async (subscription) => {
    const { user } = get()
    if (!user) return { success: false, error: 'No user logged in' }

    try {
      const { data, error } = await db.updateUserProfile(user.id, {
        subscription,
        updated_at: new Date().toISOString()
      })
      
      if (error) {
        toast.error('Failed to update subscription')
        return { success: false, error }
      }

      set({ subscription })
      return { success: true, data }
    } catch (error) {
      console.error('Set subscription error:', error)
      toast.error('An unexpected error occurred')
      return { success: false, error }
    }
  },

  // Reset password
  resetPassword: async (email) => {
    set({ loading: true })
    
    try {
      const { data, error } = await auth.resetPassword(email)
      
      if (error) {
        toast.error(error.message)
        return { success: false, error }
      }

      toast.success('Password reset email sent! Check your inbox.')
      return { success: true, data }
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error('An unexpected error occurred')
      return { success: false, error }
    } finally {
      set({ loading: false })
    }
  }
}))

export default useAuthStore
