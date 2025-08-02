import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
})

export const aiService = {
  // Generate virtual try-on using AI
  generateVirtualTryOn: async (userPhoto, productImage, productDetails) => {
    try {
      // For now, we'll use OpenAI's vision model to analyze the fit
      // In a production app, you'd use specialized fashion AI models
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this person's photo and provide virtual try-on feedback for the following clothing item: ${productDetails.name}. 
                
                Please provide:
                1. Fit assessment (how well it would fit)
                2. Style compatibility (how well it matches their style)
                3. Color compatibility (how well the color suits them)
                4. Specific recommendations for improvement
                
                Respond in JSON format with the following structure:
                {
                  "confidence": 0.85,
                  "fit": "Great fit! This size appears perfect for your body type.",
                  "style": "This style complements your look beautifully.",
                  "color": "This color suits your skin tone well.",
                  "recommendations": ["Try a smaller size for a more fitted look", "This color complements your skin tone"],
                  "overall_rating": 4.5
                }`
              },
              {
                type: "image_url",
                image_url: {
                  url: userPhoto
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })

      const content = response.choices[0].message.content
      
      try {
        const analysis = JSON.parse(content)
        
        return {
          success: true,
          data: {
            image: userPhoto, // In a real implementation, this would be the generated try-on image
            confidence: analysis.confidence || 0.85,
            feedback: {
              fit: analysis.fit || 'Good fit for your body type',
              style: analysis.style || 'This style works well for you',
              color: analysis.color || 'Nice color choice',
              recommendations: analysis.recommendations || ['Great choice!']
            },
            overall_rating: analysis.overall_rating || 4.0
          }
        }
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          success: true,
          data: {
            image: userPhoto,
            confidence: 0.8,
            feedback: {
              fit: 'Good fit for your body type',
              style: 'This style works well for you',
              color: 'Nice color choice',
              recommendations: ['Great choice! This item suits you well.']
            },
            overall_rating: 4.0
          }
        }
      }
    } catch (error) {
      console.error('AI Service Error:', error)
      
      // Return mock data if AI service fails
      return {
        success: false,
        error: error.message,
        data: {
          image: userPhoto,
          confidence: 0.7,
          feedback: {
            fit: 'Unable to analyze fit - please try again',
            style: 'Style analysis unavailable',
            color: 'Color analysis unavailable',
            recommendations: ['Please try again later for detailed analysis']
          },
          overall_rating: 3.0
        }
      }
    }
  },

  // Generate style recommendations
  generateRecommendations: async (userProfile, wardrobeItems) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: `Based on this user profile and wardrobe items, generate personalized style recommendations:
            
            User Profile: ${JSON.stringify(userProfile)}
            Wardrobe Items: ${JSON.stringify(wardrobeItems)}
            
            Please provide 5 specific outfit recommendations with explanations.
            Respond in JSON format with an array of recommendations, each having:
            - title: string
            - description: string
            - items: array of item names
            - occasion: string
            - confidence: number (0-1)`
          }
        ],
        max_tokens: 800
      })

      const content = response.choices[0].message.content
      const recommendations = JSON.parse(content)
      
      return {
        success: true,
        data: recommendations
      }
    } catch (error) {
      console.error('Recommendations Error:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  // Analyze wardrobe and suggest missing items
  analyzeWardrobe: async (wardrobeItems, userPreferences) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: `Analyze this wardrobe and suggest missing essential items:
            
            Current Wardrobe: ${JSON.stringify(wardrobeItems)}
            User Preferences: ${JSON.stringify(userPreferences)}
            
            Please identify gaps in the wardrobe and suggest 3-5 essential items to add.
            Respond in JSON format with:
            {
              "analysis": "Overall wardrobe analysis",
              "strengths": ["list of wardrobe strengths"],
              "gaps": ["list of missing items/categories"],
              "suggestions": [
                {
                  "item": "item name",
                  "reason": "why this item is needed",
                  "priority": "high/medium/low"
                }
              ]
            }`
          }
        ],
        max_tokens: 600
      })

      const content = response.choices[0].message.content
      const analysis = JSON.parse(content)
      
      return {
        success: true,
        data: analysis
      }
    } catch (error) {
      console.error('Wardrobe Analysis Error:', error)
      return {
        success: false,
        error: error.message,
        data: {
          analysis: 'Unable to analyze wardrobe at this time',
          strengths: [],
          gaps: [],
          suggestions: []
        }
      }
    }
  }
}

// Utility functions for image processing
export const imageUtils = {
  // Compress image for API upload
  compressImage: (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(resolve, 'image/jpeg', quality)
      }
      
      img.src = URL.createObjectURL(file)
    })
  },

  // Convert file to base64
  fileToBase64: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  },

  // Validate image file
  validateImage: (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Please upload a JPEG, PNG, or WebP image' }
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'Image size must be less than 5MB' }
    }
    
    return { valid: true }
  }
}

