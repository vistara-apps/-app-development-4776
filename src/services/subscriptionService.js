import { supabase, TABLES } from '../lib/supabase'

export const subscriptionService = {
  // Get user subscription
  getSubscription: async (userId) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.SUBSCRIPTIONS)
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching subscription:', error)
      return { data: null, error }
    }
  },

  // Create subscription
  createSubscription: async (userId, subscriptionData) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.SUBSCRIPTIONS)
        .insert([
          {
            user_id: userId,
            ...subscriptionData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating subscription:', error)
      return { data: null, error }
    }
  },

  // Update subscription
  updateSubscription: async (subscriptionId, updates) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.SUBSCRIPTIONS)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating subscription:', error)
      return { data: null, error }
    }
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.SUBSCRIPTIONS)
        .update({
          active: false,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      return { data: null, error }
    }
  },

  // Check if user has active subscription
  hasActiveSubscription: async (userId) => {
    try {
      const { data, error } = await subscriptionService.getSubscription(userId)
      
      if (error) return false
      if (!data) return false

      // Check if subscription is still valid
      const now = new Date()
      const expiresAt = new Date(data.expires_at)
      
      return data.active && expiresAt > now
    } catch (error) {
      console.error('Error checking subscription status:', error)
      return false
    }
  },

  // Get subscription features
  getSubscriptionFeatures: (plan) => {
    const features = {
      free: {
        virtual_try_on_limit: 3,
        wardrobe_items_limit: 10,
        ai_recommendations: false,
        premium_support: false
      },
      basic: {
        virtual_try_on_limit: 50,
        wardrobe_items_limit: 100,
        ai_recommendations: true,
        premium_support: false
      },
      premium: {
        virtual_try_on_limit: -1, // unlimited
        wardrobe_items_limit: -1, // unlimited
        ai_recommendations: true,
        premium_support: true
      }
    }

    return features[plan] || features.free
  }
}

