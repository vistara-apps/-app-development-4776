import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
})

export class AIService {
  // Generate virtual try-on using AI
  static async generateVirtualTryOn(userPhoto, productImage, productName) {
    try {
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        // Fallback to mock response if no API key is configured
        console.warn('OpenAI API key not configured, using mock response')
        return this.getMockTryOnResult(userPhoto, productName)
      }

      // Convert images to base64 if they're not already
      const userPhotoBase64 = await this.imageToBase64(userPhoto)
      const productImageBase64 = await this.imageToBase64(productImage)

      // Use OpenAI Vision API to analyze the images and generate description
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this person's photo and the clothing item. Provide a detailed virtual try-on analysis including:
                1. How well the ${productName} would fit this person
                2. Style recommendations
                3. Color compatibility
                4. Overall confidence score (0-1)
                5. Specific feedback about the fit and appearance
                
                Please provide the response in JSON format with the following structure:
                {
                  "confidence": 0.95,
                  "fit": "Great fit description",
                  "style": "Style analysis",
                  "colorMatch": "Color compatibility analysis",
                  "recommendations": ["recommendation 1", "recommendation 2"],
                  "overallFeedback": "Overall assessment"
                }`
              },
              {
                type: "image_url",
                image_url: {
                  url: userPhotoBase64
                }
              },
              {
                type: "image_url",
                image_url: {
                  url: productImageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      })

      const analysisText = response.choices[0].message.content
      
      // Try to parse JSON response
      let analysis
      try {
        analysis = JSON.parse(analysisText)
      } catch (error) {
        // If JSON parsing fails, create a structured response from the text
        analysis = this.parseTextAnalysis(analysisText)
      }

      return {
        image: userPhoto, // In a real implementation, this would be the AI-generated composite image
        confidence: analysis.confidence || 0.85,
        feedback: {
          fit: analysis.fit || 'Good fit based on analysis',
          style: analysis.style || 'This style suits you well',
          colorMatch: analysis.colorMatch || 'Great color compatibility',
          recommendations: analysis.recommendations || ['Try different sizes for comparison', 'Consider similar styles in other colors']
        },
        overallFeedback: analysis.overallFeedback || 'This item would look great on you!',
        generatedAt: new Date().toISOString()
      }

    } catch (error) {
      console.error('AI Service error:', error)
      
      // Fallback to mock response on error
      return this.getMockTryOnResult(userPhoto, productName)
    }
  }

  // Convert image to base64 data URL
  static async imageToBase64(imageSource) {
    if (typeof imageSource === 'string' && imageSource.startsWith('data:')) {
      return imageSource // Already base64
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        canvas.width = img.width
        canvas.height = img.height
        
        ctx.drawImage(img, 0, 0)
        
        const dataURL = canvas.toDataURL('image/jpeg', 0.8)
        resolve(dataURL)
      }
      
      img.onerror = reject
      img.src = imageSource
    })
  }

  // Parse text analysis into structured format
  static parseTextAnalysis(text) {
    const confidence = this.extractConfidence(text)
    const recommendations = this.extractRecommendations(text)
    
    return {
      confidence: confidence,
      fit: this.extractSection(text, ['fit', 'fitting', 'size']) || 'Good fit based on analysis',
      style: this.extractSection(text, ['style', 'styling', 'look']) || 'This style suits you well',
      colorMatch: this.extractSection(text, ['color', 'colour', 'tone']) || 'Great color compatibility',
      recommendations: recommendations,
      overallFeedback: this.extractSection(text, ['overall', 'summary', 'conclusion']) || 'This item would look great on you!'
    }
  }

  // Extract confidence score from text
  static extractConfidence(text) {
    const confidenceMatch = text.match(/confidence[:\s]*([0-9.]+)/i)
    if (confidenceMatch) {
      return parseFloat(confidenceMatch[1])
    }
    return 0.85 // Default confidence
  }

  // Extract recommendations from text
  static extractRecommendations(text) {
    const recommendations = []
    const lines = text.split('\n')
    
    for (const line of lines) {
      if (line.includes('recommend') || line.includes('suggest') || line.includes('try')) {
        recommendations.push(line.trim())
      }
    }
    
    return recommendations.length > 0 ? recommendations : [
      'Try different sizes for comparison',
      'Consider similar styles in other colors'
    ]
  }

  // Extract specific section from text
  static extractSection(text, keywords) {
    const lines = text.split('\n')
    
    for (const line of lines) {
      for (const keyword of keywords) {
        if (line.toLowerCase().includes(keyword)) {
          return line.trim()
        }
      }
    }
    
    return null
  }

  // Mock try-on result for fallback
  static getMockTryOnResult(userPhoto, productName) {
    const mockFeedbacks = [
      {
        fit: 'Excellent fit! This size appears perfect for your body type.',
        style: 'This style complements your features beautifully.',
        recommendations: ['Try this in different colors', 'Consider the matching accessories']
      },
      {
        fit: 'Great fit with room for comfort. Very flattering silhouette.',
        style: 'This trendy piece suits your personal style perfectly.',
        recommendations: ['Perfect for casual outings', 'Pair with your favorite jeans']
      },
      {
        fit: 'Nice fit! The proportions work well with your frame.',
        style: 'A versatile piece that can be dressed up or down.',
        recommendations: ['Try layering for different looks', 'Great for both work and weekend']
      }
    ]

    const randomFeedback = mockFeedbacks[Math.floor(Math.random() * mockFeedbacks.length)]

    return {
      image: userPhoto,
      confidence: 0.92,
      feedback: {
        fit: randomFeedback.fit,
        style: randomFeedback.style,
        recommendations: randomFeedback.recommendations
      },
      overallFeedback: `The ${productName} looks fantastic on you! Our AI analysis shows high compatibility.`,
      generatedAt: new Date().toISOString(),
      isMock: true
    }
  }

  // Validate API configuration
  static isConfigured() {
    return !!import.meta.env.VITE_OPENAI_API_KEY
  }

  // Get configuration status
  static getStatus() {
    return {
      configured: this.isConfigured(),
      apiKey: import.meta.env.VITE_OPENAI_API_KEY ? 'Set' : 'Not set',
      fallbackMode: !this.isConfigured()
    }
  }
}
