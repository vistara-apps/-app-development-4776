import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import useAuthStore from '../store/authStore'

const mockRecommendations = [
  {
    id: 1,
    name: 'Perfect Fit Blue Jeans',
    price: '$79.99',
    image: 'https://images.unsplash.com/photo-1542272454315-7ad9f8368e8d?w=300&h=400&fit=crop',
    matchScore: 95,
    reason: 'Based on your body measurements and style preferences',
    brand: 'DenimCo',
    sizes: ['28', '30', '32', '34'],
    colors: ['Blue', 'Black', 'Gray']
  },
  {
    id: 2,
    name: 'Comfort Cotton Tee',
    price: '$24.99',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop',
    matchScore: 92,
    reason: 'Similar to items you\'ve liked before',
    brand: 'ComfortWear',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Navy', 'Gray']
  },
  {
    id: 3,
    name: 'Elegant Evening Dress',
    price: '$129.99',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop',
    matchScore: 89,
    reason: 'Perfect for your upcoming events',
    brand: 'ElegantStyle',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black', 'Navy', 'Burgundy']
  },
  {
    id: 4,
    name: 'Casual Weekend Hoodie',
    price: '$49.99',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=400&fit=crop',
    matchScore: 87,
    reason: 'Matches your casual style preferences',
    brand: 'CozyWear',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Gray', 'Black', 'Navy', 'Maroon']
  },
  {
    id: 5,
    name: 'Professional Blazer',
    price: '$89.99',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
    matchScore: 84,
    reason: 'Great for your work wardrobe',
    brand: 'BusinessPro',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black', 'Navy', 'Charcoal']
  },
  {
    id: 6,
    name: 'Summer Floral Top',
    price: '$39.99',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
    matchScore: 81,
    reason: 'Perfect for the season',
    brand: 'FloralFashion',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Floral Print', 'Solid Blue', 'Solid Pink']
  }
]

export default function Recommendations() {
  const [favorites, setFavorites] = useState(new Set())
  const [sortBy, setSortBy] = useState('match')
  const { isAuthenticated, user } = useAuthStore()
  
  const [recommendations, setRecommendations] = useState(mockRecommendations)

  useEffect(() => {
    // Sort recommendations based on selected criteria
    const sorted = [...mockRecommendations].sort((a, b) => {
      switch (sortBy) {
        case 'match':
          return b.matchScore - a.matchScore
        case 'price-low':
          return parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', ''))
        case 'price-high':
          return parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', ''))
        default:
          return b.matchScore - a.matchScore
      }
    })
    setRecommendations(sorted)
  }, [sortBy])

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId)
    } else {
      newFavorites.add(productId)
    }
    setFavorites(newFavorites)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-12">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Personalized Recommendations
          </h1>
          <div className="card p-12">
            <h2 className="text-xl font-semibold mb-4">Sign in to see recommendations</h2>
            <p className="text-gray-600 mb-6">
              Create an account to get personalized product suggestions based on your style and preferences.
            </p>
            <div className="space-x-4">
              <a href="/register" className="btn-primary">Sign up</a>
              <a href="/login" className="btn-secondary">Sign in</a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Personalized Recommendations
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Curated just for you, {user?.name}
          </p>
        </div>

        {/* Filter and Sort */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <p className="text-gray-600">
              Showing {recommendations.length} recommendations based on your preferences
            </p>
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="match">Best Match</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recommendations.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-3 left-3 bg-primary-600 text-white px-2 py-1 rounded-full text-sm font-medium">
                  {product.matchScore}% Match
                </div>
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white shadow-md hover:bg-gray-50"
                >
                  {favorites.has(product.id) ? (
                    <HeartIconSolid className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5 text-gray-600" />
                  )}
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.brand}</p>
                </div>
                
                <div className="mb-3">
                  <p className="text-xl font-bold text-primary-600">{product.price}</p>
                  <p className="text-sm text-gray-600 mt-1">{product.reason}</p>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">Sizes: </span>
                      <span className="text-gray-600">{product.sizes.join(', ')}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="font-medium text-sm">Colors: </span>
                    <div className="flex gap-1 mt-1">
                      {product.colors.map((color) => (
                        <span
                          key={color}
                          className="px-2 py-1 text-xs bg-gray-100 rounded"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 btn-primary text-sm py-2 flex items-center justify-center">
                    <ShoppingCartIcon className="h-4 w-4 mr-1" />
                    Add to Cart
                  </button>
                  <button className="flex-1 btn-secondary text-sm py-2">
                    Try On
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="btn-secondary">
            Load More Recommendations
          </button>
        </div>
      </div>
    </div>
  )
}