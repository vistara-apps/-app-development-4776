import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import useAuthStore from '../store/authStore'
import LoadingSpinner from '../components/LoadingSpinner'
import VirtualResult from '../components/VirtualResult'

// Mock product data for demo
const mockProducts = [
  {
    id: 1,
    name: 'Classic White T-Shirt',
    image: '/api/placeholder/300/400',
    category: 'tops',
    style: 'casual',
    price: 29.99
  },
  {
    id: 2,
    name: 'Blue Denim Jeans',
    image: '/api/placeholder/300/400',
    category: 'bottoms',
    style: 'casual',
    price: 79.99
  },
  {
    id: 3,
    name: 'Elegant Black Dress',
    image: '/api/placeholder/300/400',
    category: 'dresses',
    style: 'formal',
    price: 149.99
  }
]

export default function VirtualTryOn() {
  const [step, setStep] = useState(1)
  const [userPhoto, setUserPhoto] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [virtualResult, setVirtualResult] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const { isAuthenticated } = useAuth()

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image size should be less than 10MB')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setUserPhoto(e.target.result)
        setStep(2)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProductSelect = (product) => {
    setSelectedProduct(product)
    setStep(3)
  }

  const generateVirtualTryOn = async () => {
    if (!userPhoto || !selectedProduct) {
      toast.error('Please upload a photo and select a product')
      return
    }

    if (!isAuthenticated) {
      toast.error('Please sign in to use virtual try-on')
      return
    }

    // Check subscription with new auth store method
    const hasSubscription = useAuthStore.getState().hasActiveSubscription()
    if (!hasSubscription) {
      toast.error('Please upgrade to a paid plan to use virtual try-on')
      return
    }

    setIsGenerating(true)
    
    try {
      // Import AI service dynamically to avoid issues if API key is missing
      let result
      try {
        const { aiService } = await import('../services/aiService')
        
        // Generate virtual try-on using AI
        result = await aiService.generateVirtualTryOn(
          userPhoto,
          selectedProduct.image,
          selectedProduct
        )
      } catch (importError) {
        // Fallback to legacy method if new service doesn't exist
        const { generateVirtualTryOn } = await import('../utils/aiApi')
        result = await generateVirtualTryOn(userPhoto, selectedProduct.image, {
          product_type: selectedProduct.category,
          style_preferences: selectedProduct.style
        })
      }
      
      if (result.success) {
        setVirtualResult(result.data)
        setStep(4)
        
        if (result.data.isMock) {
          toast.success('Virtual try-on generated! (Demo mode)')
        } else {
          toast.success('Virtual try-on generated successfully!')
        }
      } else {
        // Fallback to mock data if AI service fails
        setVirtualResult({
          image: userPhoto,
          confidence: 0.7,
          feedback: {
            fit: 'Analysis unavailable - using basic assessment',
            style: 'Style analysis temporarily unavailable',
            color: 'Color analysis temporarily unavailable',
            recommendations: ['AI analysis is temporarily unavailable. Please try again later for detailed feedback.']
          },
          overall_rating: 3.0,
          isMock: true
        })
        setStep(4)
        toast.warning('AI analysis unavailable, showing basic preview')
      }
      
    } catch (error) {
      console.error('Virtual try-on error:', error)
      
      // Fallback to mock data
      setVirtualResult({
        image: userPhoto,
        confidence: 0.7,
        feedback: {
          fit: 'Unable to analyze fit - please try again',
          style: 'Style analysis unavailable',
          color: 'Color analysis unavailable',
          recommendations: ['Please try again later for detailed analysis']
        },
        overall_rating: 3.0,
        error: error.message,
        isMock: true
      })
      setStep(4)
      toast.error('AI service temporarily unavailable')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/30 py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-neutral-900 mb-4">
            Virtual Try-On
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            See how clothes look on you before you buy. Upload your photo and select items to try on virtually.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepNumber 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-1 ${
                    step > stepNumber ? 'bg-primary-600' : 'bg-neutral-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-2xl font-semibold mb-6">Upload Your Photo</h2>
              <div className="border-2 border-dashed border-neutral-300 rounded-xl p-12 hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-neutral-900 mb-2">Click to upload your photo</p>
                  <p className="text-neutral-600">PNG, JPG up to 10MB</p>
                </label>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-2xl font-semibold mb-6">Select Product to Try On</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mockProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="card cursor-pointer hover:shadow-large transition-all duration-200 transform hover:-translate-y-1"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-64 object-cover rounded-t-xl"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{product.name}</h3>
                      <p className="text-primary-600 font-semibold">${product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-2xl font-semibold mb-6">Confirm & Generate</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Your Photo</h3>
                  <img
                    src={userPhoto}
                    alt="User photo"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Selected Product</h3>
                  <img
                    src={selectedProduct?.image}
                    alt={selectedProduct?.name}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <p className="mt-2 font-medium">{selectedProduct?.name}</p>
                </div>
              </div>
              <button
                onClick={generateVirtualTryOn}
                disabled={isGenerating}
                className="btn-primary btn-lg mt-8"
              >
                {isGenerating ? 'Generating...' : 'Generate Virtual Try-On'}
              </button>
            </motion.div>
          )}

          {step === 4 && virtualResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <VirtualResult
                result={virtualResult}
                originalPhoto={userPhoto}
                product={selectedProduct}
                onTryAnother={() => {
                  setStep(2)
                  setVirtualResult(null)
                }}
                onNewPhoto={() => {
                  setStep(1)
                  setUserPhoto(null)
                  setSelectedProduct(null)
                  setVirtualResult(null)
                }}
              />
            </motion.div>
          )}

          {isGenerating && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 text-center">
                <LoadingSpinner size="xl" />
                <p className="mt-4 text-lg font-medium">Generating your virtual try-on...</p>
                <p className="text-neutral-600">This may take a few moments</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}