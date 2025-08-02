import { useState, useEffect, useCallback, useRef } from 'react'
import poseDetectionService from '../services/poseDetection'

export function usePoseTracking(videoElement, options = {}) {
  const [poseData, setPoseData] = useState(null)
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const unsubscribeRef = useRef(null)

  const {
    autoStart = false,
    onPoseDetected,
    onPoseLost,
    onError,
    minConfidence = 0.5
  } = options

  // Handle pose detection results
  const handlePoseUpdate = useCallback((newPoseData) => {
    setPoseData(newPoseData)

    // Check if pose is detected with sufficient confidence
    if (newPoseData.isDetected && newPoseData.visibility >= minConfidence) {
      onPoseDetected?.(newPoseData)
    } else if (!newPoseData.isDetected) {
      onPoseLost?.(newPoseData)
    }
  }, [onPoseDetected, onPoseLost, minConfidence])

  // Start pose tracking
  const startTracking = useCallback(async () => {
    if (!videoElement) {
      const errorMsg = 'Video element is required for pose tracking'
      setError(errorMsg)
      onError?.(errorMsg)
      return false
    }

    if (isTracking) {
      return true // Already tracking
    }

    try {
      setError(null)
      setIsTracking(true)

      // Initialize pose detection service
      const initialized = await poseDetectionService.initialize()
      if (!initialized) {
        throw new Error('Failed to initialize pose detection')
      }

      setIsInitialized(true)

      // Subscribe to pose updates
      unsubscribeRef.current = poseDetectionService.subscribe(handlePoseUpdate)

      // Start detection with video element
      const started = await poseDetectionService.startDetection(videoElement)
      if (!started) {
        throw new Error('Failed to start pose detection')
      }

      return true
    } catch (err) {
      console.error('Error starting pose tracking:', err)
      setError(err.message)
      setIsTracking(false)
      onError?.(err.message)
      return false
    }
  }, [videoElement, isTracking, handlePoseUpdate, onError])

  // Stop pose tracking
  const stopTracking = useCallback(() => {
    if (!isTracking) return

    try {
      // Unsubscribe from pose updates
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }

      // Stop pose detection service
      poseDetectionService.stop()

      setIsTracking(false)
      setPoseData(null)
      setError(null)
    } catch (err) {
      console.error('Error stopping pose tracking:', err)
      setError(err.message)
      onError?.(err.message)
    }
  }, [isTracking, onError])

  // Get clothing placement for specific item
  const getClothingPlacement = useCallback((clothingType) => {
    if (!poseData || !poseData.isDetected) return null
    return poseDetectionService.getClothingPlacements(clothingType)
  }, [poseData])

  // Get body measurements
  const getBodyMeasurements = useCallback(() => {
    if (!poseData || !poseData.measurements) return null
    return poseData.measurements
  }, [poseData])

  // Check if specific body parts are visible
  const isBodyPartVisible = useCallback((bodyPart, minVisibility = 0.5) => {
    if (!poseData || !poseData.keyPoints) return false

    const keyPoints = poseData.keyPoints
    
    switch (bodyPart) {
      case 'shoulders':
        return keyPoints.shoulders?.left?.visibility >= minVisibility &&
               keyPoints.shoulders?.right?.visibility >= minVisibility
      
      case 'hips':
        return keyPoints.hips?.left?.visibility >= minVisibility &&
               keyPoints.hips?.right?.visibility >= minVisibility
      
      case 'arms':
        return keyPoints.arms?.leftWrist?.visibility >= minVisibility &&
               keyPoints.arms?.rightWrist?.visibility >= minVisibility
      
      case 'legs':
        return keyPoints.legs?.leftKnee?.visibility >= minVisibility &&
               keyPoints.legs?.rightKnee?.visibility >= minVisibility
      
      default:
        return false
    }
  }, [poseData])

  // Auto-start tracking when video element is available
  useEffect(() => {
    if (autoStart && videoElement && !isTracking) {
      startTracking()
    }
  }, [autoStart, videoElement, isTracking, startTracking])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
      if (isTracking) {
        poseDetectionService.stop()
      }
    }
  }, [isTracking])

  return {
    // State
    poseData,
    isTracking,
    isInitialized,
    error,
    
    // Actions
    startTracking,
    stopTracking,
    
    // Utilities
    getClothingPlacement,
    getBodyMeasurements,
    isBodyPartVisible,
    
    // Computed values
    isPoseDetected: poseData?.isDetected || false,
    poseConfidence: poseData?.visibility || 0,
    lastUpdate: poseData?.timestamp || null
  }
}

// Hook for simplified pose tracking with common clothing types
export function useClothingPoseTracking(videoElement, clothingType, options = {}) {
  const poseTracking = usePoseTracking(videoElement, options)
  const [clothingPlacement, setClothingPlacement] = useState(null)

  // Update clothing placement when pose changes
  useEffect(() => {
    if (poseTracking.poseData && poseTracking.isPoseDetected) {
      const placement = poseTracking.getClothingPlacement(clothingType)
      setClothingPlacement(placement)
    } else {
      setClothingPlacement(null)
    }
  }, [poseTracking.poseData, poseTracking.isPoseDetected, clothingType, poseTracking.getClothingPlacement])

  return {
    ...poseTracking,
    clothingPlacement,
    isClothingPositioned: !!clothingPlacement
  }
}

// Hook for body measurements tracking
export function useBodyMeasurements(videoElement, options = {}) {
  const poseTracking = usePoseTracking(videoElement, options)
  const [measurements, setMeasurements] = useState(null)
  const [measurementHistory, setMeasurementHistory] = useState([])

  // Update measurements when pose changes
  useEffect(() => {
    if (poseTracking.poseData && poseTracking.isPoseDetected) {
      const newMeasurements = poseTracking.getBodyMeasurements()
      if (newMeasurements) {
        setMeasurements(newMeasurements)
        
        // Keep history of measurements for averaging
        setMeasurementHistory(prev => {
          const updated = [...prev, { ...newMeasurements, timestamp: Date.now() }]
          // Keep only last 30 measurements (about 1 second at 30fps)
          return updated.slice(-30)
        })
      }
    } else {
      setMeasurements(null)
    }
  }, [poseTracking.poseData, poseTracking.isPoseDetected, poseTracking.getBodyMeasurements])

  // Calculate averaged measurements for stability
  const getAveragedMeasurements = useCallback(() => {
    if (measurementHistory.length === 0) return null

    const keys = Object.keys(measurementHistory[0]).filter(key => key !== 'timestamp')
    const averaged = {}

    keys.forEach(key => {
      const values = measurementHistory.map(m => m[key]).filter(v => typeof v === 'number')
      if (values.length > 0) {
        averaged[key] = values.reduce((sum, val) => sum + val, 0) / values.length
      }
    })

    return averaged
  }, [measurementHistory])

  return {
    ...poseTracking,
    measurements,
    measurementHistory,
    averagedMeasurements: getAveragedMeasurements(),
    hasMeasurements: !!measurements
  }
}
