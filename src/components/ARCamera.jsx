import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CameraIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

export default function ARCamera({ onCameraReady, onError, isActive = false }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasPermission, setHasPermission] = useState(null)
  const [facingMode, setFacingMode] = useState('user') // 'user' for front camera, 'environment' for back
  const [isSupported, setIsSupported] = useState(true)

  // Check AR support
  useEffect(() => {
    const checkARSupport = () => {
      const hasWebRTC = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
      const hasWebGL = (() => {
        try {
          const canvas = document.createElement('canvas')
          return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        } catch (e) {
          return false
        }
      })()
      
      const supported = hasWebRTC && hasWebGL
      setIsSupported(supported)
      
      if (!supported) {
        onError?.('AR features are not supported on this device/browser')
      }
    }

    checkARSupport()
  }, [onError])

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    if (!isSupported || !isActive) return

    setIsLoading(true)
    
    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        
        videoRef.current.onloadedmetadata = () => {
          setHasPermission(true)
          setIsLoading(false)
          onCameraReady?.(videoRef.current, canvasRef.current)
          toast.success('Camera initialized successfully!')
        }
      }
    } catch (error) {
      console.error('Camera initialization error:', error)
      setIsLoading(false)
      setHasPermission(false)
      
      let errorMessage = 'Failed to access camera'
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access and try again.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.'
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Camera not supported on this device.'
      }
      
      toast.error(errorMessage)
      onError?.(errorMessage)
    }
  }, [isSupported, isActive, facingMode, onCameraReady, onError])

  // Initialize camera when component becomes active
  useEffect(() => {
    if (isActive && isSupported) {
      initializeCamera()
    }
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [isActive, initializeCamera, isSupported])

  // Switch camera (front/back)
  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }, [])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setHasPermission(null)
  }, [])

  // Capture frame
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    return canvas.toDataURL('image/jpeg', 0.8)
  }, [])

  // Expose methods to parent
  useEffect(() => {
    if (onCameraReady && videoRef.current && canvasRef.current && hasPermission) {
      onCameraReady(videoRef.current, canvasRef.current, {
        switchCamera,
        stopCamera,
        captureFrame,
        isLoading,
        hasPermission
      })
    }
  }, [onCameraReady, hasPermission, switchCamera, stopCamera, captureFrame, isLoading])

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-neutral-100 rounded-2xl p-8">
        <XMarkIcon className="h-12 w-12 text-neutral-400 mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">AR Not Supported</h3>
        <p className="text-neutral-600 text-center">
          Your device or browser doesn't support AR features. Please try using a modern browser on a supported device.
        </p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden">
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
      />
      
      {/* Hidden Canvas for Frame Capture */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/50 flex items-center justify-center"
        >
          <div className="text-center text-white">
            <div className="loading-spinner w-12 h-12 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
            <p className="text-lg font-medium">Initializing Camera...</p>
            <p className="text-sm opacity-75 mt-2">Please allow camera access when prompted</p>
          </div>
        </motion.div>
      )}

      {/* Permission Denied Overlay */}
      {hasPermission === false && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-neutral-900 flex items-center justify-center p-8"
        >
          <div className="text-center text-white max-w-md">
            <CameraIcon className="h-16 w-16 mx-auto mb-6 opacity-50" />
            <h3 className="text-xl font-semibold mb-4">Camera Access Required</h3>
            <p className="text-neutral-300 mb-6">
              To use AR try-on features, we need access to your camera. Please allow camera permissions and try again.
            </p>
            <button
              onClick={initializeCamera}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      )}

      {/* Camera Controls */}
      {hasPermission && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 flex justify-center"
        >
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-6 py-3 flex items-center space-x-4">
            <button
              onClick={switchCamera}
              className="p-2 text-white hover:text-primary-400 transition-colors"
              title="Switch Camera"
            >
              <ArrowPathIcon className="h-6 w-6" />
            </button>
            
            <div className="text-white text-sm">
              {facingMode === 'user' ? 'Front Camera' : 'Back Camera'}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
