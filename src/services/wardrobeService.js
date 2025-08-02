import { supabase, TABLES } from '../lib/supabase'

export const wardrobeService = {
  // Get all wardrobe items for a user
  getWardrobeItems: async (userId, filters = {}) => {
    try {
      let query = supabase
        .from(TABLES.WARDROBE_ITEMS)
        .select('*')
        .eq('user_id', userId)
        .eq('deleted', false)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.color) {
        query = query.eq('color', filters.color)
      }
      if (filters.brand) {
        query = query.ilike('brand', `%${filters.brand}%`)
      }
      if (filters.season) {
        query = query.contains('seasons', [filters.season])
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching wardrobe items:', error)
      return { data: null, error }
    }
  },

  // Add new wardrobe item
  addWardrobeItem: async (userId, itemData) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.WARDROBE_ITEMS)
        .insert([
          {
            user_id: userId,
            ...itemData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error adding wardrobe item:', error)
      return { data: null, error }
    }
  },

  // Update wardrobe item
  updateWardrobeItem: async (itemId, updates) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.WARDROBE_ITEMS)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating wardrobe item:', error)
      return { data: null, error }
    }
  },

  // Delete wardrobe item (soft delete)
  deleteWardrobeItem: async (itemId) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.WARDROBE_ITEMS)
        .update({
          deleted: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error deleting wardrobe item:', error)
      return { data: null, error }
    }
  },

  // Upload item image
  uploadItemImage: async (userId, file) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}-${Math.random()}.${fileExt}`
      const filePath = `wardrobe/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('wardrobe-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('wardrobe-images')
        .getPublicUrl(filePath)

      return { data: { publicUrl }, error: null }
    } catch (error) {
      console.error('Error uploading item image:', error)
      return { data: null, error }
    }
  },

  // Get wardrobe statistics
  getWardrobeStats: async (userId) => {
    try {
      const { data: items, error } = await supabase
        .from(TABLES.WARDROBE_ITEMS)
        .select('category, color, brand, seasons')
        .eq('user_id', userId)
        .eq('deleted', false)

      if (error) throw error

      const stats = {
        totalItems: items.length,
        categories: {},
        colors: {},
        brands: {},
        seasons: {}
      }

      items.forEach(item => {
        // Count categories
        if (item.category) {
          stats.categories[item.category] = (stats.categories[item.category] || 0) + 1
        }

        // Count colors
        if (item.color) {
          stats.colors[item.color] = (stats.colors[item.color] || 0) + 1
        }

        // Count brands
        if (item.brand) {
          stats.brands[item.brand] = (stats.brands[item.brand] || 0) + 1
        }

        // Count seasons
        if (item.seasons && Array.isArray(item.seasons)) {
          item.seasons.forEach(season => {
            stats.seasons[season] = (stats.seasons[season] || 0) + 1
          })
        }
      })

      return { data: stats, error: null }
    } catch (error) {
      console.error('Error getting wardrobe stats:', error)
      return { data: null, error }
    }
  },

  // Search wardrobe items
  searchWardrobeItems: async (userId, searchTerm) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.WARDROBE_ITEMS)
        .select('*')
        .eq('user_id', userId)
        .eq('deleted', false)
        .or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error searching wardrobe items:', error)
      return { data: null, error }
    }
  },

  // Get items by category
  getItemsByCategory: async (userId, category) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.WARDROBE_ITEMS)
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .eq('deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getting items by category:', error)
      return { data: null, error }
    }
  },

  // Get favorite items
  getFavoriteItems: async (userId) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.WARDROBE_ITEMS)
        .select('*')
        .eq('user_id', userId)
        .eq('is_favorite', true)
        .eq('deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error getting favorite items:', error)
      return { data: null, error }
    }
  },

  // Toggle favorite status
  toggleFavorite: async (itemId) => {
    try {
      // First get current favorite status
      const { data: currentItem, error: fetchError } = await supabase
        .from(TABLES.WARDROBE_ITEMS)
        .select('is_favorite')
        .eq('id', itemId)
        .single()

      if (fetchError) throw fetchError

      // Toggle the favorite status
      const { data, error } = await supabase
        .from(TABLES.WARDROBE_ITEMS)
        .update({
          is_favorite: !currentItem.is_favorite,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      return { data: null, error }
    }
  }
}

// Wardrobe categories and options
export const wardrobeCategories = [
  'Tops',
  'Bottoms',
  'Dresses',
  'Outerwear',
  'Shoes',
  'Accessories',
  'Underwear',
  'Activewear',
  'Sleepwear',
  'Formal'
]

export const wardrobeColors = [
  'Black',
  'White',
  'Gray',
  'Navy',
  'Blue',
  'Red',
  'Pink',
  'Purple',
  'Green',
  'Yellow',
  'Orange',
  'Brown',
  'Beige',
  'Cream',
  'Gold',
  'Silver'
]

export const wardrobeSeasons = [
  'Spring',
  'Summer',
  'Fall',
  'Winter'
]

export const wardrobeSizes = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  'XXXL'
]

