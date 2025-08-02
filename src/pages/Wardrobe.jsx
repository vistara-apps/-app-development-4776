import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import useWardrobeStore from '../store/wardrobeStore'
import WardrobeGrid from '../components/WardrobeGrid'
import WardrobeFilters from '../components/WardrobeFilters'
import AddItemModal from '../components/AddItemModal'
import WardrobeStats from '../components/WardrobeStats'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Wardrobe() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const { user } = useAuth()
  const {
    items,
    stats,
    isLoading,
    filters,
    loadItems,
    loadStats,
    searchItems,
    setFilters,
    clearFilters,
    getFilteredItems
  } = useWardrobeStore()

  useEffect(() => {
    if (user) {
      loadItems(user.id)
      loadStats(user.id)
    }
  }, [user])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      await searchItems(user.id, searchTerm)
      setFilters({ search: searchTerm })
    } else {
      await loadItems(user.id)
      setFilters({ search: '' })
    }
  }

  const handleClearFilters = async () => {
    clearFilters()
    setSearchTerm('')
    await loadItems(user.id)
  }

  const filteredItems = getFilteredItems()
  const hasActiveFilters = Object.values(filters).some(filter => filter !== '')

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/30 py-12">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="mb-6">
            <span className="badge-primary text-sm font-medium">
              👗 Your Personal Collection
            </span>
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 sm:text-5xl lg:text-6xl">
            Virtual <span className="text-gradient">Wardrobe</span>
          </h1>
          <p className="mt-6 text-xl text-neutral-600 max-w-2xl mx-auto">
            Organize, manage, and discover new outfit combinations with your digital closet
          </p>
        </motion.div>

        {/* Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <WardrobeStats stats={stats} />
          </motion.div>
        )}

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search your wardrobe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary inline-flex items-center ${
                  hasActiveFilters ? 'bg-primary-100 text-primary-700 border-primary-200' : ''
                }`}
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 bg-primary-500 text-white text-xs rounded-full px-2 py-1">
                    {Object.values(filters).filter(f => f !== '').length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary inline-flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Item
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 flex flex-wrap gap-2 items-center"
            >
              <span className="text-sm text-neutral-600">Active filters:</span>
              {Object.entries(filters).map(([key, value]) => 
                value && (
                  <span
                    key={key}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {key}: {value}
                  </span>
                )
              )}
              <button
                onClick={handleClearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear all
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <WardrobeFilters
              filters={filters}
              onFiltersChange={setFilters}
              onApplyFilters={() => loadItems(user.id, filters)}
            />
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : filteredItems.length > 0 ? (
            <WardrobeGrid items={filteredItems} />
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                {hasActiveFilters ? 'No items match your filters' : 'Your wardrobe is empty'}
              </h3>
              <p className="text-neutral-600 mb-6">
                {hasActiveFilters 
                  ? 'Try adjusting your filters or search terms'
                  : 'Start building your digital wardrobe by adding your first item'
                }
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={handleClearFilters}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary"
                >
                  Add Your First Item
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <AddItemModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onItemAdded={() => {
            loadItems(user.id)
            loadStats(user.id)
          }}
        />
      )}
    </div>
  )
}

