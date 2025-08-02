import { aiService } from './aiService'
import { supabase } from '../lib/supabase'

// Occasion types for outfit recommendations
export const OCCASIONS = {
  WORK: 'work',
  CASUAL: 'casual',
  FORMAL: 'formal',
  DATE: 'date',
  PARTY: 'party',
  WORKOUT: 'workout',
  TRAVEL: 'travel',
  WEDDING: 'wedding',
  INTERVIEW: 'interview',
  WEEKEND: 'weekend'
}

// Style preferences
export const STYLE_PREFERENCES = {
  CLASSIC: 'classic',
  TRENDY: 'trendy',
  BOHEMIAN: 'bohemian',
  MINIMALIST: 'minimalist',
  EDGY: 'edgy',
  ROMANTIC: 'romantic',
  SPORTY: 'sporty',
  VINTAGE: 'vintage'
}

// Weather conditions
export const WEATHER_CONDITIONS = {
  HOT: 'hot',
  WARM: 'warm',
  COOL: 'cool',
  COLD: 'cold',
  RAINY: 'rainy',
  SNOWY: 'snowy'
}

class OutfitRecommendationService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY
  }

  // Generate AI-powered outfit recommendations
  async generateOutfitRecommendations(params) {
    const {
      occasion = OCCASIONS.CASUAL,
      weather = WEATHER_CONDITIONS.WARM,
      userPreferences = {},
      wardrobeItems = [],
      bodyType = 'average',
      colorPreferences = [],
      budget = 'medium',
      stylePersonality = STYLE_PREFERENCES.CLASSIC
    } = params

    try {
      // Check if API is configured
      if (!this.apiKey || this.apiKey === 'your_openai_api_key') {
        return this.getMockOutfitRecommendations(occasion, stylePersonality)
      }

      const prompt = this.buildOutfitPrompt({
        occasion,
        weather,
        userPreferences,
        wardrobeItems,
        bodyType,
        colorPreferences,
        budget,
        stylePersonality
      })

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a professional fashion stylist with expertise in creating personalized outfit recommendations. Always respond with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.8
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.choices[0].message.content

      // Parse AI response
      let outfitRecommendations
      try {
        outfitRecommendations = JSON.parse(aiResponse)
      } catch (parseError) {
        console.warn('Failed to parse AI response, using fallback')
        outfitRecommendations = this.parseTextResponse(aiResponse, occasion)
      }

      return {
        success: true,
        data: {
          outfits: outfitRecommendations.outfits || outfitRecommendations,
          occasion,
          weather,
          stylePersonality,
          generatedAt: new Date().toISOString(),
          isAiGenerated: true
        }
      }

    } catch (error) {
      console.error('Outfit recommendation error:', error)
      
      // Fallback to mock data
      return this.getMockOutfitRecommendations(occasion, stylePersonality)
    }
  }

  // Build comprehensive prompt for AI
  buildOutfitPrompt(params) {
    const {
      occasion,
      weather,
      userPreferences,
      wardrobeItems,
      bodyType,
      colorPreferences,
      budget,
      stylePersonality
    } = params

    return `Create 5 complete outfit recommendations for a ${occasion} occasion in ${weather} weather.

User Profile:
- Body Type: ${bodyType}
- Style Personality: ${stylePersonality}
- Color Preferences: ${colorPreferences.join(', ') || 'No specific preferences'}
- Budget: ${budget}
- Additional Preferences: ${JSON.stringify(userPreferences)}

Current Wardrobe Items: ${wardrobeItems.length > 0 ? JSON.stringify(wardrobeItems.slice(0, 10)) : 'No wardrobe data available'}

For each outfit, provide:
1. Outfit name/title
2. Complete item list (top, bottom, shoes, accessories)
3. Color scheme
4. Style notes explaining why it works
5. Occasion appropriateness (1-10 score)
6. Comfort level (1-10 score)
7. Estimated total cost range
8. Styling tips
9. Alternative pieces that could work

Format as JSON:
{
  "outfits": [
    {
      "id": 1,
      "name": "Outfit Name",
      "items": {
        "top": "Item description",
        "bottom": "Item description", 
        "shoes": "Item description",
        "accessories": ["accessory1", "accessory2"],
        "outerwear": "Item description (if needed)"
      },
      "colorScheme": ["color1", "color2", "color3"],
      "styleNotes": "Why this outfit works...",
      "occasionScore": 9,
      "comfortScore": 8,
      "estimatedCost": "$150-250",
      "stylingTips": ["tip1", "tip2", "tip3"],
      "alternatives": {
        "top": "Alternative top option",
        "shoes": "Alternative shoe option"
      },
      "imageUrl": "https://images.unsplash.com/photo-suitable-outfit-image",
      "tags": ["professional", "comfortable", "versatile"]
    }
  ]
}`
  }

  // Parse text response if JSON parsing fails
  parseTextResponse(text, occasion) {
    const outfits = []
    const sections = text.split(/\d+\./).filter(section => section.trim())
    
    sections.forEach((section, index) => {
      if (index < 5) { // Limit to 5 outfits
        const lines = section.trim().split('\n').filter(line => line.trim())
        if (lines.length > 0) {
          outfits.push({
            id: index + 1,
            name: lines[0].replace(/[*#]/g, '').trim() || `${occasion} Outfit ${index + 1}`,
            items: {
              top: this.extractItem(section, ['top', 'shirt', 'blouse', 'sweater']),
              bottom: this.extractItem(section, ['bottom', 'pants', 'skirt', 'jeans']),
              shoes: this.extractItem(section, ['shoes', 'boots', 'sneakers', 'heels']),
              accessories: this.extractAccessories(section)
            },
            colorScheme: this.extractColors(section),
            styleNotes: this.extractStyleNotes(section),
            occasionScore: Math.floor(Math.random() * 3) + 8, // 8-10
            comfortScore: Math.floor(Math.random() * 3) + 7, // 7-9
            estimatedCost: this.getEstimatedCost(),
            stylingTips: this.extractTips(section),
            imageUrl: this.getRandomOutfitImage(),
            tags: this.generateTags(occasion)
          })
        }
      }
    })

    return outfits.length > 0 ? outfits : this.getDefaultOutfits(occasion)
  }

  // Helper methods for parsing
  extractItem(text, keywords) {
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}[:\\s]*([^\\n]+)`, 'i')
      const match = text.match(regex)
      if (match) {
        return match[1].trim()
      }
    }
    return `${keywords[0]} item`
  }

  extractAccessories(text) {
    const accessories = []
    const accessoryKeywords = ['necklace', 'earrings', 'bracelet', 'watch', 'bag', 'belt', 'scarf', 'hat']
    
    accessoryKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        accessories.push(keyword)
      }
    })
    
    return accessories.length > 0 ? accessories : ['minimal jewelry', 'classic bag']
  }

  extractColors(text) {
    const colors = []
    const colorKeywords = ['black', 'white', 'blue', 'red', 'green', 'yellow', 'purple', 'pink', 'brown', 'gray', 'navy', 'beige', 'cream', 'olive', 'burgundy']
    
    colorKeywords.forEach(color => {
      if (text.toLowerCase().includes(color)) {
        colors.push(color)
      }
    })
    
    return colors.length > 0 ? colors : ['neutral', 'classic']
  }

  extractStyleNotes(text) {
    const sentences = text.split('.').filter(s => s.trim().length > 20)
    return sentences.length > 0 ? sentences[0].trim() + '.' : 'A well-coordinated outfit perfect for the occasion.'
  }

  extractTips(text) {
    const tips = []
    const lines = text.split('\n')
    
    lines.forEach(line => {
      if (line.includes('tip') || line.includes('style') || line.includes('wear')) {
        tips.push(line.trim())
      }
    })
    
    return tips.length > 0 ? tips.slice(0, 3) : [
      'Choose comfortable fabrics',
      'Pay attention to fit',
      'Coordinate colors thoughtfully'
    ]
  }

  getEstimatedCost() {
    const ranges = ['$50-100', '$100-200', '$200-350', '$350-500']
    return ranges[Math.floor(Math.random() * ranges.length)]
  }

  getRandomOutfitImage() {
    const images = [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop'
    ]
    return images[Math.floor(Math.random() * images.length)]
  }

  generateTags(occasion) {
    const tagMap = {
      work: ['professional', 'polished', 'confident'],
      casual: ['comfortable', 'relaxed', 'versatile'],
      formal: ['elegant', 'sophisticated', 'refined'],
      date: ['romantic', 'stylish', 'attractive'],
      party: ['fun', 'trendy', 'eye-catching'],
      workout: ['athletic', 'functional', 'breathable'],
      travel: ['comfortable', 'practical', 'wrinkle-resistant'],
      wedding: ['formal', 'celebratory', 'appropriate'],
      interview: ['professional', 'conservative', 'impressive'],
      weekend: ['casual', 'comfortable', 'effortless']
    }
    
    return tagMap[occasion] || ['stylish', 'appropriate', 'comfortable']
  }

  // Mock outfit recommendations for fallback
  getMockOutfitRecommendations(occasion, stylePersonality) {
    const mockOutfits = this.getDefaultOutfits(occasion)
    
    return {
      success: true,
      data: {
        outfits: mockOutfits,
        occasion,
        stylePersonality,
        generatedAt: new Date().toISOString(),
        isAiGenerated: false,
        isMock: true,
        message: 'Using demo data - configure OpenAI API key for AI-powered recommendations'
      }
    }
  }

  getDefaultOutfits(occasion) {
    const outfitTemplates = {
      work: [
        {
          id: 1,
          name: 'Classic Professional',
          items: {
            top: 'Crisp white button-down shirt',
            bottom: 'Navy tailored trousers',
            shoes: 'Black leather loafers',
            accessories: ['simple watch', 'structured handbag'],
            outerwear: 'Navy blazer'
          },
          colorScheme: ['navy', 'white', 'black'],
          styleNotes: 'A timeless professional look that exudes confidence and competence.',
          occasionScore: 10,
          comfortScore: 8,
          estimatedCost: '$200-350',
          stylingTips: ['Ensure proper fit', 'Keep accessories minimal', 'Iron clothes well'],
          imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
          tags: ['professional', 'classic', 'versatile']
        },
        {
          id: 2,
          name: 'Modern Business Casual',
          items: {
            top: 'Silk blouse in soft pink',
            bottom: 'Charcoal pencil skirt',
            shoes: 'Nude block heels',
            accessories: ['delicate necklace', 'leather tote'],
            outerwear: 'Light cardigan'
          },
          colorScheme: ['pink', 'charcoal', 'nude'],
          styleNotes: 'Sophisticated yet approachable, perfect for client meetings.',
          occasionScore: 9,
          comfortScore: 7,
          estimatedCost: '$180-280',
          stylingTips: ['Choose comfortable heel height', 'Coordinate metals', 'Layer thoughtfully'],
          imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=600&fit=crop',
          tags: ['business casual', 'feminine', 'polished']
        }
      ],
      casual: [
        {
          id: 1,
          name: 'Weekend Comfort',
          items: {
            top: 'Soft cotton t-shirt',
            bottom: 'Well-fitted jeans',
            shoes: 'White sneakers',
            accessories: ['crossbody bag', 'baseball cap'],
            outerwear: 'Denim jacket'
          },
          colorScheme: ['white', 'blue', 'denim'],
          styleNotes: 'Effortlessly cool and comfortable for everyday activities.',
          occasionScore: 9,
          comfortScore: 10,
          estimatedCost: '$80-150',
          stylingTips: ['Choose quality basics', 'Ensure good fit', 'Add personal touches'],
          imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=600&fit=crop',
          tags: ['casual', 'comfortable', 'versatile']
        }
      ],
      formal: [
        {
          id: 1,
          name: 'Elegant Evening',
          items: {
            top: 'Silk camisole',
            bottom: 'Black wide-leg trousers',
            shoes: 'Strappy heeled sandals',
            accessories: ['statement earrings', 'clutch purse'],
            outerwear: 'Tailored blazer'
          },
          colorScheme: ['black', 'gold', 'nude'],
          styleNotes: 'Sophisticated and elegant, perfect for formal events.',
          occasionScore: 10,
          comfortScore: 6,
          estimatedCost: '$300-500',
          stylingTips: ['Focus on fit and quality', 'Choose one statement piece', 'Consider the venue'],
          imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=600&fit=crop',
          tags: ['formal', 'elegant', 'sophisticated']
        }
      ]
    }

    return outfitTemplates[occasion] || outfitTemplates.casual
  }

  // Save user's outfit preferences
  async saveOutfitPreferences(userId, preferences) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          outfit_preferences: preferences,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error saving preferences:', error)
      return { success: false, error: error.message }
    }
  }

  // Get user's outfit preferences
  async getUserPreferences(userId) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('outfit_preferences')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return {
        success: true,
        data: data?.outfit_preferences || {}
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
      return { success: false, error: error.message }
    }
  }

  // Get influencer partnerships (mock data for now)
  async getInfluencerPartnerships() {
    // In a real implementation, this would fetch from a database
    return {
      success: true,
      data: [
        {
          id: 1,
          name: 'Sarah Style',
          specialty: 'Minimalist Fashion',
          followers: '250K',
          rating: 4.8,
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          bio: 'Helping you build a capsule wardrobe with timeless pieces.',
          sessionPrice: '$75/hour',
          availability: 'Available this week'
        },
        {
          id: 2,
          name: 'Alex Trends',
          specialty: 'Street Style',
          followers: '180K',
          rating: 4.9,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          bio: 'Street style expert with a focus on urban fashion trends.',
          sessionPrice: '$60/hour',
          availability: 'Available tomorrow'
        },
        {
          id: 3,
          name: 'Emma Elegance',
          specialty: 'Formal Wear',
          followers: '320K',
          rating: 4.7,
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          bio: 'Specializing in elegant formal wear and special occasion styling.',
          sessionPrice: '$90/hour',
          availability: 'Available next week'
        }
      ]
    }
  }

  // Book a styling session (mock implementation)
  async bookStylingSession(influencerId, sessionDetails) {
    // In a real implementation, this would integrate with a booking system
    return {
      success: true,
      data: {
        bookingId: `booking_${Date.now()}`,
        influencerId,
        sessionDetails,
        status: 'confirmed',
        message: 'Styling session booked successfully! You will receive a confirmation email shortly.'
      }
    }
  }
}

export const outfitRecommendationService = new OutfitRecommendationService()
export default outfitRecommendationService
