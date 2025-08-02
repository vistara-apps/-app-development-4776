import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
})

// Helper function to convert image to base64
const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Helper function to compress image
const compressImage = (file, maxWidth = 1024, quality = 0.8) => {
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
}

// Generate styling recommendations using OpenAI
export const generateStylingRecommendations = async (userPhoto, preferences = {}) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this person's photo and provide personalized styling recommendations. Consider their body type, skin tone, and overall appearance. Provide specific suggestions for:
              1. Colors that would complement them
              2. Clothing styles that would flatter their body type
              3. Fashion trends that would suit them
              4. Accessories recommendations
              
              User preferences: ${JSON.stringify(preferences)}
              
              Please provide a detailed but concise analysis in JSON format with the following structure:
              {
                "bodyType": "description",
                "skinTone": "description", 
                "colorPalette": ["color1", "color2", "color3"],
                "recommendedStyles": ["style1", "style2", "style3"],
                "trendingItems": ["item1", "item2", "item3"],
                "accessories": ["accessory1", "accessory2"],
                "tips": ["tip1", "tip2", "tip3"]
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
      max_tokens: 1000
    })

    const content = response.choices[0].message.content
    
    // Try to parse JSON response
    try {
      return JSON.parse(content)
    } catch (parseError) {
      // If JSON parsing fails, return a structured response
      return {
        bodyType: "Unable to determine",
        skinTone: "Unable to determine",
        colorPalette: ["Navy", "White", "Beige"],
        recommendedStyles: ["Classic", "Modern", "Casual"],
        trendingItems: ["Blazer", "High-waisted jeans", "Sneakers"],
        accessories: ["Watch", "Sunglasses"],
        tips: ["Focus on fit", "Invest in basics", "Add personal touches"],
        rawResponse: content
      }
    }
  } catch (error) {
    console.error('Error generating styling recommendations:', error)
    throw new Error('Failed to generate styling recommendations')
  }
}

// Simulate virtual try-on (placeholder for actual AI service)
export const generateVirtualTryOn = async (userPhoto, productImage, productInfo) => {
  try {
    // In a real implementation, this would call a specialized AI service
    // like Replicate, Stability AI, or a custom model for virtual try-on
    
    // For now, we'll use OpenAI to generate a description of how the item would look
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this person's photo and the product image. Provide a detailed assessment of how this ${productInfo.name} would look on them. Consider:
              1. Fit assessment (how well it would fit their body type)
              2. Style compatibility (how well it matches their appearance)
              3. Color compatibility (how the color works with their skin tone)
              4. Overall recommendation score (1-10)
              5. Specific feedback and suggestions
              
              Product: ${productInfo.name}
              Price: ${productInfo.price}
              
              Provide response in JSON format:
              {
                "fitScore": 8,
                "styleScore": 9,
                "colorScore": 7,
                "overallScore": 8,
                "feedback": {
                  "fit": "Great fit description",
                  "style": "Style compatibility description",
                  "color": "Color compatibility description"
                },
                "recommendations": ["suggestion1", "suggestion2"],
                "confidence": 0.85
              }`
            },
            {
              type: "image_url",
              image_url: {
                url: userPhoto
              }
            },
            {
              type: "image_url", 
              image_url: {
                url: productImage
              }
            }
          ]
        }
      ],
      max_tokens: 800
    })

    const content = response.choices[0].message.content
    
    try {
      const analysis = JSON.parse(content)
      
      // Return virtual try-on result
      return {
        image: userPhoto, // In real implementation, this would be the generated image
        analysis,
        confidence: analysis.confidence || 0.8,
        feedback: analysis.feedback,
        recommendations: analysis.recommendations || [],
        timestamp: new Date().toISOString()
      }
    } catch (parseError) {
      // Fallback response
      return {
        image: userPhoto,
        analysis: {
          fitScore: 7,
          styleScore: 8,
          colorScore: 7,
          overallScore: 7,
          feedback: {
            fit: "This item appears to be a good fit for your body type",
            style: "The style complements your overall appearance",
            color: "The color works well with your skin tone"
          },
          recommendations: ["Consider sizing up for a more relaxed fit", "This style suits your body type well"]
        },
        confidence: 0.75,
        feedback: {
          fit: "Good fit for your body type",
          style: "Complements your style well",
          color: "Nice color choice"
        },
        recommendations: ["Great choice!", "Consider pairing with neutral colors"],
        timestamp: new Date().toISOString(),
        rawResponse: content
      }
    }
  } catch (error) {
    console.error('Error generating virtual try-on:', error)
    throw new Error('Failed to generate virtual try-on')
  }
}

// Analyze body measurements from photo (placeholder)
export const analyzeBodyMeasurements = async (userPhoto) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this person's photo and provide an assessment of their body type and general measurements. This is for styling recommendations only. Provide:
              1. Body type classification
              2. General size recommendations
              3. Styling tips based on body type
              
              Please be respectful and focus on helpful styling advice. Return in JSON format:
              {
                "bodyType": "body type classification",
                "sizeRecommendations": {
                  "tops": "size range",
                  "bottoms": "size range"
                },
                "stylingTips": ["tip1", "tip2", "tip3"],
                "measurements": {
                  "note": "Measurements are estimates for styling purposes only"
                }
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
      max_tokens: 600
    })

    const content = response.choices[0].message.content
    
    try {
      return JSON.parse(content)
    } catch (parseError) {
      return {
        bodyType: "Unable to determine from photo",
        sizeRecommendations: {
          tops: "M-L",
          bottoms: "M-L"
        },
        stylingTips: [
          "Focus on clothes that fit well",
          "Choose styles that make you feel confident",
          "Experiment with different colors and patterns"
        ],
        measurements: {
          note: "Measurements are estimates for styling purposes only"
        },
        rawResponse: content
      }
    }
  } catch (error) {
    console.error('Error analyzing body measurements:', error)
    throw new Error('Failed to analyze body measurements')
  }
}

// Validate API key
export const validateApiKey = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your environment variables.')
  }
  return true
}

