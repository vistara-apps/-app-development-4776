import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CameraIcon, 
  XMarkIcon, 
  ArrowPathIcon,
  PhotoIcon,
  AdjustmentsHorizontalIcon,
  ShareIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import ARCamera from '../components/ARCamera'
import ARScene from '../components/ARScene'
import ARControls from '../components/ARControls'
import ProductSelector from '../components/ProductSelector'
import { useClothingPoseTracking } from '../hooks/usePoseTracking'
import useAuthStore from '../store/authStore'
import useARStore from '../store/arStore'

export default function ARTryOn() {
  const [isARActive, setIsARActive] = useState(false)
  const [videoElement, setVideoElement] = useState(null)
  const [canvasElement, setCanvasElement] = useState(null)
  const [cameraControls, setCameraControls] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedVideo, setRecordedVideo] = useState(null)
  
  const { isAuthenticated, subscription } = useAuthStore()
  const { 
    arModels, 
    lighting, 
    addModel, 
    removeModel, 
    updateModel,
    updateLighting,
    saveSession,
    loadSession
  } = useARStore()

  // Pose tracking for the selected product type
  const {
    poseData,
    isTracking,
    isPoseDetected,
    poseConfidence,
    clothingPlacement,
    startTracking,
    stopTracking,
    error: poseError
  } = useClothingPoseTracking(
    videoElement, 
    selectedProduct?.category || 'shirt',
    {
      autoStart: false,
      minConfidence: 0.6,
      onPoseDetected: (pose) => {
        console.log('Pose detected:', pose)
      },
      onPoseLost: () => {
        console.log('Pose lost')
      },
      onError: (error) => {
        toast.error(`Pose tracking error: ${error}`)
      }
    }
  )

  // Handle camera initialization
  const handleCameraReady = useCallback((video, canvas, controls) => {
    setVideoElement(video)
    setCanvasElement(canvas)
    setCameraControls(controls)
    
    // Start pose tracking when camera is ready
    if (video && selectedProduct) {
      startTracking()
    }
  }, [startTracking, selectedProduct])

  // Handle camera errors
  const handleCameraError = useCallback((error) => {
    toast.error(error)
    setIsARActive(false)
  }, [])

  // Start AR session
  const startARSession = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to use AR try-on')
      return
    }

    if (!subscription) {
      toast.error('Please upgrade to a paid plan to use AR features')
      return
    }

    setIsARActive(true)
    toast.success('AR session started!')
  }, [isAuthenticated, subscription])

  // Stop AR session
  const stopARSession = useCallback(() => {
    setIsARActive(false)
    stopTracking()
    if (cameraControls?.stopCamera) {
      cameraControls.stopCamera()
    }
    setVideoElement(null)
    setCanvasElement(null)
    setCameraControls(null)
    toast.success('AR session ended')
  }, [stopTracking, cameraControls])

  // Handle product selection
  const handleProductSelect = useCallback((product) => {
    setSelectedProduct(product)
    setShowProductSelector(false)
    
    // Add product as 3D model
    const model = {
      id: `model_${Date.now()}`,
      type: product.category,
      name: product.name,
      color: product.color || '#4F46E5',
      texture: product.image,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    }
    
    addModel(model)
    toast.success(`${product.name} added to AR scene`)
  }, [addModel])

  // Handle model updates from AR scene
  const handleModelUpdate = useCallback((modelId, updates) => {
    updateModel(modelId, updates)
  }, [updateModel])

  // Capture AR screenshot
  const captureScreenshot = useCallback(() => {
    if (!canvasElement) {
      toast.error('Cannot capture screenshot - camera not ready')
      return
    }

    try {
      const screenshot = cameraControls?.captureFrame()
      if (screenshot) {
        // Create download link
        const link = document.createElement('a')
        link.download = `ar-tryon-${Date.now()}.jpg`
        link.href = screenshot
        link.click()
        
        toast.success('Screenshot saved!')
      }
    } catch (error) {
      console.error('Screenshot error:', error)
      toast.error('Failed to capture screenshot')
    }
  }, [canvasElement, cameraControls])

  // Start/stop recording
  const toggleRecording = useCallback(async () => {
    if (!videoElement) {
      toast.error('Camera not ready for recording')
      return
    }

    if (isRecording) {
      // Stop recording logic would go here
      setIsRecording(false)
      toast.success('Recording stopped')
    } else {
      // Start recording logic would go here
      setIsRecording(true)
      toast.success('Recording started')
    }
  }, [videoElement, isRecording])

  // Save AR session
  const handleSaveSession = useCallback(async () => {
    try {
      const sessionData = {
        models: arModels,
        lighting,
        selectedProduct,
        timestamp: Date.now()
      }
      
      await saveSession(sessionData)
      toast.success('AR session saved!')
    } catch (error) {
      console.error('Save session error:', error)
      toast.error('Failed to save session')
    }
  }, [arModels, lighting, selectedProduct, saveSession])

  // Update lighting when pose changes
  useEffect(() => {
    if (isPoseDetected && clothingPlacement) {
      // Adjust lighting based on pose position
      updateLighting({
        ambient: 0.4,
        directional: 0.8,
        point: 0.3,
        position: [clothingPlacement.position.x * 5, 5, 5]
      })
    }
  }, [isPoseDetected, clothingPlacement, updateLighting])

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/30">
      {/* Header */}
      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-neutral-900"
            >
              AR <span className="text-gradient">Try-On</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-neutral-600 mt-2"
            >
              Experience immersive virtual try-on with real-time AR
            </motion.p>
          </div>
          
          {isARActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-4"
            >
              <button
                onClick={() => setShowProductSelector(true)}
                className="btn-secondary"
              >
                <PhotoIcon className="h-5 w-5 mr-2" />
                Select Product
              </button>
              
              <button
                onClick={() => setShowControls(!showControls)}
                className="btn-secondary"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                Controls
              </button>
              
              <button
                onClick={stopARSession}
                className="btn-outline text-red-600 border-red-200 hover:bg-red-50"
              >
                <XMarkIcon className="h-5 w-5 mr-2" />
                Stop AR
              </button>
            </motion.div>
          )}
        </div>

        {/* AR Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main AR View */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-elevated p-0 overflow-hidden"
            >
              {!isARActive ? (
                // AR Start Screen
                <div className="aspect-video bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <CameraIcon className="h-12 w-12" />
                    </motion.div>
                    
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl font-bold mb-4"
                    >
                      Start AR Try-On
                    </motion.h2>
                    
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-primary-100 mb-8 max-w-md mx-auto"
                    >
                      Experience clothing in augmented reality with real-time pose tracking and 3D visualization
                    </motion.p>
                    
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      onClick={startARSession}
                      className="btn-white btn-lg group"
                    >
                      <CameraIcon className="h-6 w-6 mr-3" />
                      <span>Start AR Session</span>
                      <ArrowPathIcon className="h-5 w-5 ml-3 transition-transform group-hover:rotate-180" />
                    </motion.button>
                  </div>
                </div>
              ) : (
                // AR Camera and Scene
                <div className="aspect-video relative">
                  {/* Camera Feed */}
                  <ARCamera
                    onCameraReady={handleCameraReady}
                    onError={handleCameraError}
                    isActive={isARActive}
                  />
                  
                  {/* AR Scene Overlay */}
                  {videoElement && (
                    <div className="absolute inset-0">
                      <ARScene
                        videoElement={videoElement}
                        models={arModels}
                        poseData={poseData}
                        lighting={lighting}
                        controls={{ enableOrbit: false }}
                        onModelUpdate={handleModelUpdate}
                        className="w-full h-full"
                      />
                    </div>
                  )}
                  
                  {/* AR Status Overlay */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    {/* Pose Status */}
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          isPoseDetected ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        <span>
                          {isPoseDetected 
                            ? `Pose Detected (${Math.round(poseConfidence * 100)}%)`
                            : 'No Pose Detected'
                          }
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={captureScreenshot}
                        className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
                        title="Take Screenshot"
                      >
                        <PhotoIcon className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={toggleRecording}
                        className={`p-2 backdrop-blur-sm rounded-lg text-white transition-colors ${
                          isRecording 
                            ? 'bg-red-500/80 hover:bg-red-600/80' 
                            : 'bg-black/50 hover:bg-black/70'
                        }`}
                        title={isRecording ? 'Stop Recording' : 'Start Recording'}
                      >
                        <div className={`w-5 h-5 ${
                          isRecording ? 'bg-white rounded-sm' : 'bg-white rounded-full'
                        }`} />
                      </button>
                      
                      <button
                        onClick={handleSaveSession}
                        className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
                        title="Save Session"
                      >
                        <BookmarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Product Info */}
            {selectedProduct && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card-elevated p-6"
              >
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Current Product</h3>
                <div className="space-y-4">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-medium text-neutral-900">{selectedProduct.name}</h4>
                    <p className="text-primary-600 font-medium">{selectedProduct.price}</p>
                    <p className="text-sm text-neutral-600 mt-1">{selectedProduct.category}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Pose Information */}
            {isPoseDetected && poseData && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card-elevated p-6"
              >
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Body Tracking</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Confidence:</span>
                    <span className="font-medium">{Math.round(poseConfidence * 100)}%</span>
                  </div>
                  
                  {poseData.measurements && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Shoulder Width:</span>
                        <span className="font-medium">
                          {(poseData.measurements.shoulderWidth * 100).toFixed(1)}cm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Torso Height:</span>
                        <span className="font-medium">
                          {(poseData.measurements.torsoHeight * 100).toFixed(1)}cm
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            {isARActive && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card-elevated p-6"
              >
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowProductSelector(true)}
                    className="w-full btn-secondary text-left"
                  >
                    <PhotoIcon className="h-4 w-4 mr-2" />
                    Change Product
                  </button>
                  
                  <button
                    onClick={captureScreenshot}
                    className="w-full btn-secondary text-left"
                  >
                    <CameraIcon className="h-4 w-4 mr-2" />
                    Take Photo
                  </button>
                  
                  <button
                    onClick={() => {/* Share functionality */}}
                    className="w-full btn-secondary text-left"
                  >
                    <ShareIcon className="h-4 w-4 mr-2" />
                    Share Result
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Product Selector Modal */}
      <AnimatePresence>
        {showProductSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowProductSelector(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Select Product for AR</h2>
                <button
                  onClick={() => setShowProductSelector(false)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <ProductSelector
                onProductSelect={handleProductSelect}
                selectedProduct={selectedProduct}
                mode="ar"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AR Controls Panel */}
      <AnimatePresence>
        {showControls && isARActive && (
          <ARControls
            models={arModels}
            lighting={lighting}
            onUpdateModel={updateModel}
            onUpdateLighting={updateLighting}
            onClose={() => setShowControls(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
