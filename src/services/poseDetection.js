import { Pose } from '@mediapipe/pose'
import { Camera } from '@mediapipe/camera_utils'

class PoseDetectionService {
  constructor() {
    this.pose = null
    this.camera = null
    this.isInitialized = false
    this.callbacks = new Set()
    this.lastPoseData = null
    this.isProcessing = false
  }

  // Initialize MediaPipe Pose
  async initialize() {
    if (this.isInitialized) return true

    try {
      // Initialize MediaPipe Pose
      this.pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        }
      })

      // Configure pose detection
      this.pose.setOptions({
        modelComplexity: 1, // 0, 1, or 2 (higher = more accurate but slower)
        smoothLandmarks: true,
        enableSegmentation: false, // Set to true if you need body segmentation
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })

      // Set up result callback
      this.pose.onResults((results) => {
        this.handlePoseResults(results)
      })

      this.isInitialized = true
      console.log('Pose detection initialized successfully')
      return true
    } catch (error) {
      console.error('Failed to initialize pose detection:', error)
      return false
    }
  }

  // Start pose detection with video element
  async startDetection(videoElement) {
    if (!this.isInitialized) {
      const initialized = await this.initialize()
      if (!initialized) return false
    }

    try {
      // Initialize camera with video element
      this.camera = new Camera(videoElement, {
        onFrame: async () => {
          if (!this.isProcessing && this.pose) {
            this.isProcessing = true
            await this.pose.send({ image: videoElement })
            this.isProcessing = false
          }
        },
        width: 1280,
        height: 720
      })

      // Start camera
      this.camera.start()
      console.log('Pose detection started')
      return true
    } catch (error) {
      console.error('Failed to start pose detection:', error)
      return false
    }
  }

  // Stop pose detection
  stop() {
    if (this.camera) {
      this.camera.stop()
      this.camera = null
    }
    this.isProcessing = false
    console.log('Pose detection stopped')
  }

  // Handle pose detection results
  handlePoseResults(results) {
    const poseData = {
      landmarks: results.poseLandmarks || [],
      worldLandmarks: results.poseWorldLandmarks || [],
      visibility: this.calculateAverageVisibility(results.poseLandmarks),
      timestamp: Date.now(),
      isDetected: !!(results.poseLandmarks && results.poseLandmarks.length > 0)
    }

    // Add derived measurements
    if (poseData.landmarks.length > 0) {
      poseData.measurements = this.calculateBodyMeasurements(poseData.landmarks)
      poseData.keyPoints = this.extractKeyPoints(poseData.landmarks)
    }

    this.lastPoseData = poseData

    // Notify all callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(poseData)
      } catch (error) {
        console.error('Error in pose detection callback:', error)
      }
    })
  }

  // Calculate average visibility of detected landmarks
  calculateAverageVisibility(landmarks) {
    if (!landmarks || landmarks.length === 0) return 0

    const totalVisibility = landmarks.reduce((sum, landmark) => {
      return sum + (landmark.visibility || 0)
    }, 0)

    return totalVisibility / landmarks.length
  }

  // Calculate body measurements from landmarks
  calculateBodyMeasurements(landmarks) {
    if (!landmarks || landmarks.length < 33) return null

    try {
      // Key landmark indices (MediaPipe Pose)
      const leftShoulder = landmarks[11]
      const rightShoulder = landmarks[12]
      const leftHip = landmarks[23]
      const rightHip = landmarks[24]
      const leftWrist = landmarks[15]
      const rightWrist = landmarks[16]
      const nose = landmarks[0]
      const leftAnkle = landmarks[27]
      const rightAnkle = landmarks[28]

      // Calculate distances (normalized coordinates)
      const shoulderWidth = this.calculateDistance(leftShoulder, rightShoulder)
      const hipWidth = this.calculateDistance(leftHip, rightHip)
      const torsoHeight = this.calculateDistance(
        { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 },
        { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 }
      )
      const armSpan = this.calculateDistance(leftWrist, rightWrist)
      const height = this.calculateDistance(
        nose,
        { x: (leftAnkle.x + rightAnkle.x) / 2, y: (leftAnkle.y + rightAnkle.y) / 2 }
      )

      return {
        shoulderWidth,
        hipWidth,
        torsoHeight,
        armSpan,
        height,
        // Body proportions (useful for clothing sizing)
        shoulderToHipRatio: shoulderWidth / hipWidth,
        armSpanToHeightRatio: armSpan / height
      }
    } catch (error) {
      console.error('Error calculating body measurements:', error)
      return null
    }
  }

  // Extract key points for clothing placement
  extractKeyPoints(landmarks) {
    if (!landmarks || landmarks.length < 33) return null

    return {
      // Upper body
      shoulders: {
        left: landmarks[11],
        right: landmarks[12],
        center: {
          x: (landmarks[11].x + landmarks[12].x) / 2,
          y: (landmarks[11].y + landmarks[12].y) / 2,
          z: (landmarks[11].z + landmarks[12].z) / 2
        }
      },
      // Torso
      chest: {
        center: {
          x: (landmarks[11].x + landmarks[12].x) / 2,
          y: (landmarks[11].y + landmarks[12].y) / 2 + 0.1,
          z: (landmarks[11].z + landmarks[12].z) / 2
        }
      },
      // Hips
      hips: {
        left: landmarks[23],
        right: landmarks[24],
        center: {
          x: (landmarks[23].x + landmarks[24].x) / 2,
          y: (landmarks[23].y + landmarks[24].y) / 2,
          z: (landmarks[23].z + landmarks[24].z) / 2
        }
      },
      // Arms
      arms: {
        leftElbow: landmarks[13],
        rightElbow: landmarks[14],
        leftWrist: landmarks[15],
        rightWrist: landmarks[16]
      },
      // Legs
      legs: {
        leftKnee: landmarks[25],
        rightKnee: landmarks[26],
        leftAnkle: landmarks[27],
        rightAnkle: landmarks[28]
      }
    }
  }

  // Calculate distance between two points
  calculateDistance(point1, point2) {
    if (!point1 || !point2) return 0
    
    const dx = point1.x - point2.x
    const dy = point1.y - point2.y
    const dz = (point1.z || 0) - (point2.z || 0)
    
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  // Subscribe to pose detection updates
  subscribe(callback) {
    this.callbacks.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback)
    }
  }

  // Get last detected pose data
  getLastPoseData() {
    return this.lastPoseData
  }

  // Check if pose detection is active
  isActive() {
    return this.isInitialized && this.camera !== null
  }

  // Get clothing placement suggestions based on pose
  getClothingPlacements(clothingType) {
    if (!this.lastPoseData || !this.lastPoseData.keyPoints) {
      return null
    }

    const { keyPoints } = this.lastPoseData

    switch (clothingType) {
      case 'shirt':
      case 'top':
        return {
          position: keyPoints.chest.center,
          scale: keyPoints.shoulders ? 
            this.calculateDistance(keyPoints.shoulders.left, keyPoints.shoulders.right) * 2 : 1,
          rotation: this.calculateShoulderRotation(keyPoints.shoulders)
        }

      case 'pants':
      case 'jeans':
        return {
          position: keyPoints.hips.center,
          scale: keyPoints.hips ? 
            this.calculateDistance(keyPoints.hips.left, keyPoints.hips.right) * 2 : 1,
          rotation: this.calculateHipRotation(keyPoints.hips)
        }

      case 'dress':
        return {
          position: {
            x: keyPoints.chest.center.x,
            y: (keyPoints.chest.center.y + keyPoints.hips.center.y) / 2,
            z: keyPoints.chest.center.z
          },
          scale: Math.max(
            this.calculateDistance(keyPoints.shoulders.left, keyPoints.shoulders.right),
            this.calculateDistance(keyPoints.hips.left, keyPoints.hips.right)
          ) * 2,
          rotation: this.calculateTorsoRotation(keyPoints)
        }

      default:
        return {
          position: keyPoints.chest.center,
          scale: 1,
          rotation: 0
        }
    }
  }

  // Calculate shoulder rotation for clothing alignment
  calculateShoulderRotation(shoulders) {
    if (!shoulders || !shoulders.left || !shoulders.right) return 0
    
    const dx = shoulders.right.x - shoulders.left.x
    const dy = shoulders.right.y - shoulders.left.y
    
    return Math.atan2(dy, dx)
  }

  // Calculate hip rotation for clothing alignment
  calculateHipRotation(hips) {
    if (!hips || !hips.left || !hips.right) return 0
    
    const dx = hips.right.x - hips.left.x
    const dy = hips.right.y - hips.left.y
    
    return Math.atan2(dy, dx)
  }

  // Calculate overall torso rotation
  calculateTorsoRotation(keyPoints) {
    const shoulderRotation = this.calculateShoulderRotation(keyPoints.shoulders)
    const hipRotation = this.calculateHipRotation(keyPoints.hips)
    
    // Average the rotations for overall torso alignment
    return (shoulderRotation + hipRotation) / 2
  }
}

// Create singleton instance
const poseDetectionService = new PoseDetectionService()

export default poseDetectionService
