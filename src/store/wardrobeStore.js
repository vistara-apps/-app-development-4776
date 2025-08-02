import { create } from 'zustand'
import { wardrobeService } from '../services/wardrobeService'
import { toast } from 'react-hot-toast'

const useWardrobeStore = create((set, get) => ({
  items: [],
  stats: null,
  isLoading: false,
  filters: {
    category: '',
    color: '',
    brand: '',
    season: '',
    search: ''
  },
  selectedItems: [],

  // Load wardrobe items
  loadItems: async (userId, filters = {}) => {
    try {
      set({ isLoading: true })
      
      const { data, error } = await wardrobeService.getWardrobeItems(userId, filters)
      
      if (error) {
        toast.error('Failed to load wardrobe items')
        set({ isLoading: false })
        return
      }

      set({ items: data || [], isLoading: false })
    } catch (error) {
      console.error('Error loading wardrobe items:', error)
      toast.error('Failed to load wardrobe items')
      set({ isLoading: false })
    }
  },

  // Add new item
  addItem: async (userId, itemData) => {
    try {
      set({ isLoading: true })
      
      const { data, error } = await wardrobeService.addWardrobeItem(userId, itemData)
      
      if (error) {
        toast.error('Failed to add item to wardrobe')
        set({ isLoading: false })
        return { success: false, error }
      }

      // Add to local state
      set(state => ({
        items: [data, ...state.items],
        isLoading: false
      }))
      
      toast.success('Item added to wardrobe!')
      return { success: true, data }
    } catch (error) {
      console.error('Error adding wardrobe item:', error)
      toast.error('Failed to add item to wardrobe')
      set({ isLoading: false })
      return { success: false, error }
    }
  },

  // Update item
  updateItem: async (itemId, updates) => {
    try {
      const { data, error } = await wardrobeService.updateWardrobeItem(itemId, updates)
      
      if (error) {
        toast.error('Failed to update item')
        return { success: false, error }
      }

      // Update local state
      set(state => ({
        items: state.items.map(item => 
          item.id === itemId ? data : item
        )
      }))
      
      toast.success('Item updated successfully!')
      return { success: true, data }
    } catch (error) {
      console.error('Error updating wardrobe item:', error)
      toast.error('Failed to update item')
      return { success: false, error }
    }
  },

  // Delete item
  deleteItem: async (itemId) => {
    try {
      const { error } = await wardrobeService.deleteWardrobeItem(itemId)
      
      if (error) {
        toast.error('Failed to delete item')
        return { success: false, error }
      }

      // Remove from local state
      set(state => ({
        items: state.items.filter(item => item.id !== itemId)
      }))
      
      toast.success('Item removed from wardrobe')
      return { success: true }
    } catch (error) {
      console.error('Error deleting wardrobe item:', error)
      toast.error('Failed to delete item')
      return { success: false, error }
    }
  },

  // Toggle favorite
  toggleFavorite: async (itemId) => {
    try {
      const { data, error } = await wardrobeService.toggleFavorite(itemId)
      
      if (error) {
        toast.error('Failed to update favorite status')
        return { success: false, error }
      }

      // Update local state
      set(state => ({
        items: state.items.map(item => 
          item.id === itemId ? data : item
        )
      }))
      
      return { success: true, data }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorite status')
      return { success: false, error }
    }
  },

  // Load wardrobe statistics
  loadStats: async (userId) => {
    try {
      const { data, error } = await wardrobeService.getWardrobeStats(userId)
      
      if (error) {
        console.error('Failed to load wardrobe stats:', error)
        return
      }

      set({ stats: data })
    } catch (error) {
      console.error('Error loading wardrobe stats:', error)
    }
  },

  // Search items
  searchItems: async (userId, searchTerm) => {
    try {
      set({ isLoading: true })
      
      const { data, error } = await wardrobeService.searchWardrobeItems(userId, searchTerm)
      
      if (error) {
        toast.error('Search failed')
        set({ isLoading: false })
        return
      }

      set({ items: data || [], isLoading: false })
    } catch (error) {
      console.error('Error searching wardrobe items:', error)
      toast.error('Search failed')
      set({ isLoading: false })
    }
  },

  // Set filters
  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }))
  },

  // Clear filters
  clearFilters: () => {
    set({
      filters: {
        category: '',
        color: '',
        brand: '',
        season: '',
        search: ''
      }
    })
  },

  // Select/deselect items
  toggleItemSelection: (itemId) => {
    set(state => ({
      selectedItems: state.selectedItems.includes(itemId)
        ? state.selectedItems.filter(id => id !== itemId)
        : [...state.selectedItems, itemId]
    }))
  },

  // Clear selection
  clearSelection: () => {
    set({ selectedItems: [] })
  },

  // Select all items
  selectAllItems: () => {
    const { items } = get()
    set({ selectedItems: items.map(item => item.id) })
  },

  // Get filtered items
  getFilteredItems: () => {
    const { items, filters } = get()
    
    return items.filter(item => {
      if (filters.category && item.category !== filters.category) return false
      if (filters.color && item.color !== filters.color) return false
      if (filters.brand && !item.brand?.toLowerCase().includes(filters.brand.toLowerCase())) return false
      if (filters.season && !item.seasons?.includes(filters.season)) return false
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const searchFields = [item.name, item.brand, item.description].filter(Boolean)
        if (!searchFields.some(field => field.toLowerCase().includes(searchLower))) return false
      }
      return true
    })
  },

  // Get items by category
  getItemsByCategory: (category) => {
    const { items } = get()
    return items.filter(item => item.category === category)
  },

  // Get favorite items
  getFavoriteItems: () => {
    const { items } = get()
    return items.filter(item => item.is_favorite)
  }
}))

export default useWardrobeStore

