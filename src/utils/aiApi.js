import { env } from '../config/env'

// AI API client for virtual try-on generation
class AIApiClient {
  constructor() {
    this.baseUrl = env.AI_API_URL
    this.apiKey = env.AI_API_KEY
  }

  // Check if AI API is configured
  isConfigured() {
    return !!(this.baseUrl && this.apiKey)
  }

  // Generate virtual try-on using AI API
  async generateVirtualTryOn(userPhoto, productImage, options = {}) {
    if (!this.isConfigured()) {
      // Fallback to mock generation if AI API is not configured
      return this.mockGeneration(userPhoto, productImage, options)
    }

    try {
      const formData = new FormData()
      
      // Convert base64 images to blobs if needed
      const userBlob = this.base64ToBlob(userPhoto)
      const productBlob = this.base64ToBlob(productImage)
      
      formData.append('user_image', userBlob, 'user.jpg')
      formData.append('product_image', productBlob, 'product.jpg')
      formData.append('options', JSON.stringify(options))

      const response = await fetch(`${this.baseUrl}/virtual-tryon`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      
      return {
        success: true,
        data: {
          image: result.generated_image,
          confidence: result.confidence || 0.85,
          feedback: result.feedback || {
            fit: 'Good fit detected',
            style: 'Style matches well',
            recommendations: ['Great choice!']
          },
          processingTime: result.processing_time
        }
      }
    } catch (error) {
      console.error('AI API error:', error)
      
      // Fallback to mock generation on error
      console.warn('Falling back to mock generation due to AI API error')
      return this.mockGeneration(userPhoto, productImage, options)
    }
  }

  // Mock generation for development/fallback
  async mockGeneration(userPhoto, productImage, options = {}) {
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000))
    
    // Generate mock confidence score
    const confidence = 0.75 + Math.random() * 0.2 // 75-95%
    
    // Mock feedback based on confidence
    const feedback = {
      fit: confidence > 0.9 ? 'Excellent fit!' : confidence > 0.8 ? 'Great fit!' : 'Good fit',
      style: confidence > 0.85 ? 'Perfect style match!' : 'This style suits you well',
      recommendations: [
        'This color complements your skin tone',
        confidence > 0.8 ? 'Perfect size selection' : 'Consider trying a different size',
        'Great choice for your body type'
      ].filter(Boolean)
    }

    return {
      success: true,
      data: {
        image: userPhoto, // In real implementation, this would be the AI-generated image
        confidence,
        feedback,
        processingTime: 3.2,
        isMock: true
      }
    }
  }

  // Convert base64 string to Blob
  base64ToBlob(base64String) {
    // Handle data URLs
    if (base64String.startsWith('data:')) {
      const [header, data] = base64String.split(',')
      const mimeType = header.match(/:(.*?);/)[1]
      const byteCharacters = atob(data)
      const byteNumbers = new Array(byteCharacters.length)
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      
      const byteArray = new Uint8Array(byteNumbers)
      return new Blob([byteArray], { type: mimeType })
    }
    
    // Handle plain base64
    const byteCharacters = atob(base64String)
    const byteNumbers = new Array(byteCharacters.length)
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: 'image/jpeg' })
  }

  // Get API status
  async getStatus() {
    if (!this.isConfigured()) {
      return {
        status: 'not_configured',
        message: 'AI API credentials not configured'
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/status`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        return {
          status: 'online',
          ...data
        }
      } else {
        return {
          status: 'error',
          message: `API returned ${response.status}`
        }
      }
    } catch (error) {
      return {
        status: 'offline',
        message: error.message
      }
    }
  }
}

// Export singleton instance
export const aiApi = new AIApiClient()

// Export utility functions
export const generateVirtualTryOn = (userPhoto, productImage, options) => {
  return aiApi.generateVirtualTryOn(userPhoto, productImage, options)
}

export const getAIApiStatus = () => {
  return aiApi.getStatus()
}

export default aiApi

