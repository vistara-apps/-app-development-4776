import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { CameraIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import useTryOnStore from '../store/tryOnStore'
import useAuthStore from '../store/authStore'
import ProductSelector from '../components/ProductSelector'
import VirtualResult from '../components/VirtualResult'

export default function VirtualTryOn() {
  const [step, setStep] = useState(1)
  const fileInputRef = useRef(null)
  const { 
    selectedProduct, 
    userPhoto, 
    virtualResult,
    isGenerating,
    setUserPhoto, 
    setVirtualResult,
    setIsGenerating 
  } = useTryOnStore()
  const { isAuthenticated, subscription } = useAuthStore()

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo size must be less than 5MB')
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

  const generateVirtualTryOn = async () => {
    if (!selectedProduct || !userPhoto) {
      toast.error('Please select a product and upload a photo')
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
      const { aiService } = await import('../services/aiService')
      
      // Generate virtual try-on using AI
      const result = await aiService.generateVirtualTryOn(
        userPhoto,
        selectedProduct.image,
        selectedProduct
      )
      
      if (result.success) {
        setVirtualResult(result.data)
        setStep(4)
        toast.success('Virtual try-on generated successfully!')
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
          overall_rating: 3.0
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
        overall_rating: 3.0
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
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="badge-primary text-sm font-medium">
              ✨ AI-Powered Virtual Fitting
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold text-neutral-900 sm:text-5xl lg:text-6xl"
          >
            Virtual <span className="text-gradient">Try-On</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-xl text-neutral-600 max-w-2xl mx-auto"
          >
            Upload your photo and see how clothes look on you with our advanced AI technology
          </motion.p>
        </div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <nav aria-label="Progress">
            <ol className="flex items-center justify-center space-x-8 max-w-4xl mx-auto">
              {[
                { id: 1, name: 'Upload Photo', icon: '📸' },
                { id: 2, name: 'Select Product', icon: '👕' },
                { id: 3, name: 'Generate', icon: '✨' },
                { id: 4, name: 'View Result', icon: '🎉' }
              ].map((stepItem, index) => (
                <li key={stepItem.id} className="flex flex-col items-center relative">
                  <div className="flex items-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all duration-300 ${
                        step >= stepItem.id
                          ? 'border-primary-500 bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-soft scale-110'
                          : step === stepItem.id - 1
                          ? 'border-primary-300 bg-primary-50 text-primary-600 animate-pulse'
                          : 'border-neutral-300 bg-white text-neutral-400'
                      }`}
                    >
                      {step >= stepItem.id ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-lg">{stepItem.icon}</span>
                      )}
                    </div>
                    {index < 3 && (
                      <div className={`ml-8 h-0.5 w-16 transition-all duration-300 ${
                        step > stepItem.id ? 'bg-primary-500' : 'bg-neutral-200'
                      }`} aria-hidden="true" />
                    )}
                  </div>
                  <span className={`mt-3 text-sm font-medium transition-colors duration-200 ${
                    step >= stepItem.id ? 'text-primary-600' : 'text-neutral-500'
                  }`}>
                    {stepItem.name}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        </motion.div>

        {/* Step Content */}
        <div className="card-elevated p-8 lg:p-12 max-w-4xl mx-auto">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-3xl font-semibold text-neutral-900 mb-8">Upload Your Photo</h2>
              <div className="border-2 border-dashed border-primary-200 bg-primary-50/50 rounded-2xl p-12 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-soft">
                    <CameraIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                    Take or Upload a Photo
                  </h3>
                  <p className="text-neutral-600 mb-6 max-w-md">
                    Take a clear, well-lit photo from the waist up. Make sure you're facing the camera directly for the best results.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-primary btn-lg inline-flex items-center group"
                  >
                    <PhotoIcon className="mr-3 h-5 w-5" />
                    <span>Choose Photo</span>
                    <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <p className="text-xs text-neutral-500 mt-4">
                    Supported formats: JPG, PNG, WEBP (Max 5MB)
                  </p>
                </div>
              </div>
              
              {userPhoto && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="mt-8"
                >
                  <div className="inline-block p-2 bg-white rounded-2xl shadow-medium">
                    <img
                      src={userPhoto}
                      alt="User upload"
                      className="h-48 w-48 object-cover rounded-xl"
                    />
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => setStep(2)}
                      className="btn-primary btn-lg group"
                    >
                      <span>Continue to Product Selection</span>
                      <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ProductSelector onNext={() => setStep(3)} />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-3xl font-semibold text-neutral-900 mb-8">Generate Virtual Try-On</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {userPhoto && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xl font-semibold text-neutral-900">Your Photo</h3>
                    <div className="card-hover p-4 inline-block">
                      <img
                        src={userPhoto}
                        alt="User upload"
                        className="h-64 w-64 object-cover rounded-xl"
                      />
                    </div>
                  </motion.div>
                )}
                
                {selectedProduct && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xl font-semibold text-neutral-900">Selected Product</h3>
                    <div className="card-hover p-6 inline-block">
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="h-48 w-48 object-cover rounded-xl mx-auto mb-4"
                      />
                      <h4 className="font-semibold text-neutral-900 text-lg">{selectedProduct.name}</h4>
                      <p className="text-primary-600 font-medium text-xl">{selectedProduct.price}</p>
                    </div>
                  </motion.div>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                {isGenerating ? (
                  <div className="space-y-6">
                    <div className="w-16 h-16 mx-auto">
                      <div className="loading-spinner w-16 h-16 border-4"></div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-neutral-900">Creating your virtual try-on...</h3>
                      <p className="text-neutral-600">Our AI is analyzing your photo and fitting the selected item. This may take a few moments.</p>
                      <div className="progress-bar max-w-md mx-auto">
                        <div className="progress-fill w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={generateVirtualTryOn}
                    disabled={!selectedProduct || !userPhoto}
                    className="btn-primary btn-xl disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <span className="text-lg">✨ Generate Virtual Try-On</span>
                    <svg className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}

          {step === 4 && virtualResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <VirtualResult result={virtualResult} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
