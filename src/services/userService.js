import { supabase, TABLES } from '../lib/supabase'

export const userService = {
  // Create user profile after signup
  createProfile: async (userId, profileData) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .insert([
          {
            id: userId,
            ...profileData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating profile:', error)
      return { data: null, error }
    }
  },

  // Get user profile
  getProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching profile:', error)
      return { data: null, error }
    }
  },

  // Update user profile
  updateProfile: async (userId, updates) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { data: null, error }
    }
  },

  // Upload avatar image
  uploadAvatar: async (userId, file) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return { data: { publicUrl }, error: null }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      return { data: null, error }
    }
  },

  // Set body measurements
  setBodyMeasurements: async (userId, measurements) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .update({
          body_measurements: measurements,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error setting body measurements:', error)
      return { data: null, error }
    }
  }
}

