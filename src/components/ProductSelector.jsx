import { useState } from 'react'
import { motion } from 'framer-motion'
import useTryOnStore from '../store/tryOnStore'

const mockProducts = [
  {
    id: 1,
    name: 'Classic White T-Shirt',
    price: '$29.99',
    category: 'Shirts',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: 2,
    name: 'Denim Jacket',
    price: '$89.99',
    category: 'Jackets',
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300&h=300&fit=crop',
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: 3,
    name: 'Summer Dress',
    price: '$69.99',
    category: 'Dresses',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop',
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: 4,
    name: 'Business Shirt',
    price: '$49.99',
    category: 'Shirts',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop',
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: 5,
    name: 'Casual Hoodie',
    price: '$39.99',
    category: 'Hoodies',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop',
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: 6,
    name: 'Elegant Blouse',
    price: '$59.99',
    category: 'Blouses',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop',
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  }
]

export default function ProductSelector({ onNext }) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const { selectedProduct, setSelectedProduct } = useTryOnStore()
  
  const categories = ['All', ...new Set(mockProducts.map(p => p.category))]
  const filteredProducts = selectedCategory === 'All' 
    ? mockProducts 
    : mockProducts.filter(p => p.category === selectedCategory)

  const handleProductSelect = (product) => {
    setSelectedProduct(product)
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-center">Select a Product</h2>
      
      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleProductSelect(product)}
            className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
              selectedProduct?.id === product.id
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-40 object-cover rounded-lg mb-3"
            />
            <h3 className="font-medium text-sm mb-1">{product.name}</h3>
            <p className="text-primary-600 font-semibold text-sm">{product.price}</p>
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Available sizes:</p>
              <div className="flex gap-1">
                {product.sizes.map((size) => (
                  <span
                    key={size}
                    className="px-1.5 py-0.5 text-xs bg-gray-100 rounded"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Next Button */}
      {selectedProduct && (
        <div className="text-center">
          <button onClick={onNext} className="btn-primary">
            Continue with {selectedProduct.name}
          </button>
        </div>
      )}
    </div>
  )
}