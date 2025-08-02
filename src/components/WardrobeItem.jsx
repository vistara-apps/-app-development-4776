import { useState } from 'react'
import { motion } from 'framer-motion'
import { HeartIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import useWardrobeStore from '../store/wardrobeStore'
import { toast } from 'react-hot-toast'

export default function WardrobeItem({ item }) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const { toggleFavorite, deleteItem } = useWardrobeStore()

  const handleToggleFavorite = async (e) => {
    e.stopPropagation()
    await toggleFavorite(item.id)
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to remove this item from your wardrobe?')) {
      await deleteItem(item.id)
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const formatPrice = (price) => {
    if (!price) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-soft overflow-hidden cursor-pointer group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-neutral-100">
        {!imageError && item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
        )}

        {/* Overlay Actions */}
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          <div className="flex gap-2">
            <button
              onClick={handleToggleFavorite}
              className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200"
            >
              {item.is_favorite ? (
                <HeartSolidIcon className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-neutral-600" />
              )}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                toast.info('Edit functionality coming soon!')
              }}
              className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200"
            >
              <PencilIcon className="h-5 w-5 text-neutral-600" />
            </button>
            
            <button
              onClick={handleDelete}
              className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200"
            >
              <TrashIcon className="h-5 w-5 text-red-500" />
            </button>
          </div>
        </motion.div>

        {/* Category Badge */}
        {item.category && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-white bg-opacity-90 text-xs font-medium text-neutral-700 rounded-full">
              {item.category}
            </span>
          </div>
        )}

        {/* Favorite Badge */}
        {item.is_favorite && (
          <div className="absolute top-3 right-3">
            <HeartSolidIcon className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-neutral-900 truncate">
            {item.name}
          </h3>
          {item.brand && (
            <p className="text-sm text-neutral-600 truncate">
              {item.brand}
            </p>
          )}
        </div>

        {/* Details */}
        <div className="flex items-center justify-between mb-3">
          {item.color && (
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-neutral-200"
                style={{ backgroundColor: item.color.toLowerCase() }}
              />
              <span className="text-sm text-neutral-600">{item.color}</span>
            </div>
          )}
          
          {item.size && (
            <span className="text-sm font-medium text-neutral-700 bg-neutral-100 px-2 py-1 rounded">
              {item.size}
            </span>
          )}
        </div>

        {/* Price */}
        {item.price && (
          <div className="mb-3">
            <span className="text-lg font-semibold text-primary-600">
              {formatPrice(item.price)}
            </span>
          </div>
        )}

        {/* Seasons */}
        {item.seasons && item.seasons.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.seasons.map((season) => (
              <span
                key={season}
                className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded-full"
              >
                {season}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {item.description && (
          <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
            {item.description}
          </p>
        )}
      </div>
    </motion.div>
  )
}

