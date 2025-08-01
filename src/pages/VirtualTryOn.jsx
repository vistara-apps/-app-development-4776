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

    if (!subscription) {
      toast.error('Please upgrade to a paid plan to use virtual try-on')
      return
    }

    setIsGenerating(true)
    
    try {
      // Simulate API call to generate virtual try-on
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock result
      setVirtualResult({
        image: userPhoto, // In real implementation, this would be the generated image
        confidence: 0.95,
        feedback: {
          fit: 'Great fit!',
          style: 'This style suits you well',
          recommendations: ['Try a smaller size for a more fitted look', 'This color complements your skin tone']
        }
      })
      
      setStep(4)
      toast.success('Virtual try-on generated successfully!')
      
    } catch (error) {
      toast.error('Failed to generate virtual try-on')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Virtual Try-On
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Upload your photo and see how clothes look on you
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-center space-x-5">
              {[
                { id: 1, name: 'Upload Photo' },
                { id: 2, name: 'Select Product' },
                { id: 3, name: 'Generate' },
                { id: 4, name: 'View Result' }
              ].map((stepItem, index) => (
                <li key={stepItem.id} className="flex items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      step >= stepItem.id
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : 'border-gray-300 text-gray-500'
                    }`}
                  >
                    {stepItem.id}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    step >= stepItem.id ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    {stepItem.name}
                  </span>
                  {index < 3 && (
                    <div className="ml-5 h-px w-12 bg-gray-300" aria-hidden="true" />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Step Content */}
        <div className="card p-8">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-2xl font-semibold mb-6">Upload Your Photo</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
                <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <p className="text-lg text-gray-600 mb-4">
                    Take a clear, well-lit photo from the waist up
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
                    className="btn-primary inline-flex items-center"
                  >
                    <PhotoIcon className="mr-2 h-5 w-5" />
                    Choose Photo
                  </button>
                </div>
              </div>
              
              {userPhoto && (
                <div className="mt-6">
                  <img
                    src={userPhoto}
                    alt="User upload"
                    className="mx-auto h-32 w-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setStep(2)}
                    className="btn-primary mt-4"
                  >
                    Next Step
                  </button>
                </div>
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
              <h2 className="text-2xl font-semibold mb-6">Generate Virtual Try-On</h2>
              <div className="space-y-6">
                {userPhoto && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Your Photo</h3>
                    <img
                      src={userPhoto}
                      alt="User upload"
                      className="mx-auto h-48 w-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                {selectedProduct && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Selected Product</h3>
                    <div className="inline-block p-4 border rounded-lg">
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="h-32 w-32 object-cover rounded-lg mx-auto"
                      />
                      <p className="mt-2 font-medium">{selectedProduct.name}</p>
                      <p className="text-gray-600">{selectedProduct.price}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={generateVirtualTryOn}
                  disabled={isGenerating || !selectedProduct || !userPhoto}
                  className="btn-primary text-lg px-8 py-3 disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Generate Virtual Try-On'}
                </button>
              </div>
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