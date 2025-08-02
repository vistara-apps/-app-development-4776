import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  subscription: null,
  bodyMeasurements: null,
  
  // Initialize auth state from Supabase
  initialize: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      
      if (session?.user) {
        await get().setUser(session.user)
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  
  // Set user and fetch profile
  setUser: async (user) => {
    if (user) {
      try {
        // Fetch user profile from database
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw error
        }
        
        set({ 
          user, 
          profile,
          isAuthenticated: true,
          subscription: profile?.subscription_active ? {
            plan: profile.subscription_plan,
            active: profile.subscription_active,
            expiresAt: profile.subscription_expires_at
          } : null,
          bodyMeasurements: profile?.body_measurements
        })
      } catch (error) {
        console.error('Error fetching profile:', error)
        set({ 
          user, 
          isAuthenticated: true,
          profile: null,
          subscription: null,
          bodyMeasurements: null
        })
      }
    } else {
      set({ 
        user: null, 
        profile: null,
        isAuthenticated: false, 
        subscription: null,
        bodyMeasurements: null 
      })
    }
  },
  
  // Login with email and password
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    
    if (data.user) {
      await get().setUser(data.user)
    }
    
    return data
  },
  
  // Register new user
  register: async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })
    
    if (error) throw error
    return data
  },
  
  // Logout
  logout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    set({ 
      user: null, 
      profile: null,
      isAuthenticated: false, 
      subscription: null,
      bodyMeasurements: null 
    })
  },
  
  // Update profile
  updateProfile: async (updates) => {
    const { user } = get()
    if (!user) throw new Error('No authenticated user')
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) throw error
    
    set((state) => ({
      profile: { ...state.profile, ...data },
      user: { ...state.user, ...updates }
    }))
    
    return data
  },
  
  // Set body measurements
  setBodyMeasurements: async (measurements) => {
    const { user } = get()
    if (!user) throw new Error('No authenticated user')
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        body_measurements: measurements,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) throw error
    
    set({ 
      bodyMeasurements: measurements,
      profile: { ...get().profile, body_measurements: measurements }
    })
    
    return data
  },
  
  // Set subscription
  setSubscription: async (subscription) => {
    const { user } = get()
    if (!user) throw new Error('No authenticated user')
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        subscription_plan: subscription.plan,
        subscription_active: subscription.active,
        subscription_expires_at: subscription.expiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) throw error
    
    set({ 
      subscription,
      profile: { 
        ...get().profile, 
        subscription_plan: subscription.plan,
        subscription_active: subscription.active,
        subscription_expires_at: subscription.expiresAt
      }
    })
    
    return data
  }
}))

export default useAuthStore
