import { supabase, getUserProfile, getSubscriptionStatus } from '../lib/supabase'

export class AuthService {
  // Sign up with email and password
  static async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) throw error

      // Create profile if user was created
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          email: data.user.email,
          name: userData.name || '',
          ...userData
        })
      }

      return { user: data.user, session: data.session }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  // Sign in with email and password
  static async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Get user profile and subscription status
      const profile = await getUserProfile(data.user.id)
      const subscription = await getSubscriptionStatus(data.user.id)

      return {
        user: data.user,
        session: data.session,
        profile,
        subscription
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  // Sign out
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  // Get current session
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error

      if (session?.user) {
        // Get user profile and subscription status
        const profile = await getUserProfile(session.user.id)
        const subscription = await getSubscriptionStatus(session.user.id)

        return {
          user: session.user,
          session,
          profile,
          subscription
        }
      }

      return null
    } catch (error) {
      console.error('Get session error:', error)
      return null
    }
  }

  // Create user profile
  static async createUserProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          ...profileData,
          subscription_status: 'free',
          subscription_plan: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Create profile error:', error)
      throw error
    }
  }

  // Update user profile
  static async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  // Reset password
  static async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  // Update password
  static async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
    } catch (error) {
      console.error('Update password error:', error)
      throw error
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      let userData = null

      if (session?.user) {
        try {
          const profile = await getUserProfile(session.user.id)
          const subscription = await getSubscriptionStatus(session.user.id)
          
          userData = {
            user: session.user,
            session,
            profile,
            subscription
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }

      callback(event, userData)
    })
  }
}
