import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  SparklesIcon,
  UserGroupIcon,
  CalendarIcon,
  CloudIcon,
  AdjustmentsHorizontalIcon,
  HeartIcon,
  ShoppingCartIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { toast } from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import LoadingSpinner from '../components/LoadingSpinner'
import { outfitRecommendationService, OCCASIONS, STYLE_PREFERENCES, WEATHER_CONDITIONS } from '../services/outfitRecommendationService'

export default function OutfitRecommendations() {
  const [favorites, setFavorites] = useState(new Set())
  const [outfits, setOutfits] = useState([])
  const [influencers, setInfluencers] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('outfits')
  
  // Recommendation filters
  const [selectedOccasion, setSelectedOccasion] = useState(OCCASIONS.CASUAL)
  const [selectedWeather, setSelectedWeather] = useState(WEATHER_CONDITIONS.WARM)
  const [selectedStyle, setSelectedStyle] = useState(STYLE_PREFERENCES.CLASSIC)
  const [showFilters, setShowFilters] = useState(false)
  const [budget, setBudget] = useState('medium')
  const [bodyType, setBodyType] = useState('average')
  const [colorPreference, setColorPreference] = useState('neutral')
  
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      loadOutfitRecommendations()
      loadInfluencerPartnerships()
    }
  }, [isAuthenticated, selectedOccasion, selectedWeather, selectedStyle])

  const loadOutfitRecommendations = async () => {
    setLoading(true)
    try {
      const result = await outfitRecommendationService.generateOutfitRecommendations({
        occasion: selectedOccasion,
        weather: selectedWeather,
        stylePersonality: selectedStyle,
        userPreferences: {
          budget,
          bodyType,
          colorPreference
        },
        wardrobeItems: [],
        bodyType,
        colorPreferences: [colorPreference],
        budget
      })

      if (result.success) {
        setOutfits(result.data.outfits || [])
        if (result.data.isMock) {
          toast.info('Using demo data - configure OpenAI API key for AI-powered recommendations')
        } else {
          toast.success('AI outfit recommendations generated!')
        }
      } else {
        toast.error('Failed to load outfit recommendations')
      }
    } catch (error) {
      console.error('Error loading recommendations:', error)
      toast.error('Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  const loadInfluencerPartnerships = async () => {
    try {
      const result = await outfitRecommendationService.getInfluencerPartnerships()
      if (result.success) {
        setInfluencers(result.data || [])
      }
    } catch (error) {
      console.error('Error loading influencers:', error)
    }
  }

  const toggleFavorite = (outfitId) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(outfitId)) {
      newFavorites.delete(outfitId)
      toast.success('Removed from favorites')
    } else {
      newFavorites.add(outfitId)
      toast.success('Added to favorites')
    }
    setFavorites(newFavorites)
  }

  const bookStylingSession = async (influencerId) => {
    try {
      const result = await outfitRecommendationService.bookStylingSession(influencerId, {
        date: new Date().toISOString(),
        duration: 60,
        type: 'virtual'
      })
      
      if (result.success) {
        toast.success(result.data.message)
      } else {
        toast.error('Failed to book session')
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Failed to book session')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-12">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            AI-Powered Outfit Recommendations
          </h1>
          <div className="card p-12">
            <SparklesIcon className="h-16 w-16 text-primary-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4">Sign in to get personalized outfit recommendations</h2>
            <p className="text-gray-600 mb-6">
              Get AI-powered outfit suggestions for any occasion, connect with style influencers, and book live styling sessions.
            </p>
            <div className="space-x-4">
              <a href="/register" className="btn-primary">Sign up</a>
              <a href="/login" className="btn-secondary">Sign in</a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl flex items-center justify-center gap-3">
            <SparklesIcon className="h-8 w-8 text-primary-600" />
            AI Outfit Recommendations
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Personalized outfit suggestions for every occasion, {user?.name}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('outfits')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'outfits'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <SparklesIcon className="h-5 w-5 inline mr-2" />
                AI Outfit Suggestions
              </button>
              <button
                onClick={() => setActiveTab('influencers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'influencers'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UserGroupIcon className="h-5 w-5 inline mr-2" />
                Style Influencers & Live Sessions
              </button>
            </nav>
          </div>
        </div>

        {/* Outfit Recommendations Tab */}
        {activeTab === 'outfits' && (
          <>
            {/* Filters */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
                
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-gray-500" />
                  <select
                    value={selectedOccasion}
                    onChange={(e) => setSelectedOccasion(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    {Object.entries(OCCASIONS).map(([key, value]) => (
                      <option key={key} value={value}>
                        {key.charAt(0) + key.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <CloudIcon className="h-5 w-5 text-gray-500" />
                  <select
                    value={selectedWeather}
                    onChange={(e) => setSelectedWeather(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    {Object.entries(WEATHER_CONDITIONS).map(([key, value]) => (
                      <option key={key} value={value}>
                        {key.charAt(0) + key.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-gray-500" />
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    {Object.entries(STYLE_PREFERENCES).map(([key, value]) => (
                      <option key={key} value={value}>
                        {key.charAt(0) + key.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="card p-6 bg-gray-50"
                >
                  <h3 className="text-lg font-semibold mb-4">Advanced Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget Range
                      </label>
                      <select 
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      >
                        <option value="low">Under $100</option>
                        <option value="medium">$100 - $300</option>
                        <option value="high">$300+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Body Type
                      </label>
                      <select 
                        value={bodyType}
                        onChange={(e) => setBodyType(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      >
                        <option value="average">Average</option>
                        <option value="petite">Petite</option>
                        <option value="tall">Tall</option>
                        <option value="curvy">Curvy</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color Preference
                      </label>
                      <select 
                        value={colorPreference}
                        onChange={(e) => setColorPreference(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      >
                        <option value="neutral">Neutral Colors</option>
                        <option value="bright">Bright Colors</option>
                        <option value="dark">Dark Colors</option>
                        <option value="pastel">Pastel Colors</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button 
                      onClick={loadOutfitRecommendations}
                      className="btn-primary"
                    >
                      Apply Filters & Generate New Outfits
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <LoadingSpinner size="lg" text="Generating AI outfit recommendations..." />
              </div>
            )}

            {/* Outfit Recommendations Grid */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {outfits.map((outfit, index) => (
                  <motion.div
                    key={outfit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="card overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative">
                      <img
                        src={outfit.imageUrl}
                        alt={outfit.name}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-primary-600 text-white px-2 py-1 rounded-full text-sm font-medium">
                        {outfit.occasionScore}/10 Match
                      </div>
                      <div className="absolute top-3 right-3 flex gap-2">
                        <div className="bg-white rounded-full px-2 py-1 text-xs font-medium text-gray-700">
                          {outfit.comfortScore}/10 Comfort
                        </div>
                        <button
                          onClick={() => toggleFavorite(outfit.id)}
                          className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50"
                        >
                          {favorites.has(outfit.id) ? (
                            <HeartIconSolid className="h-5 w-5 text-red-500" />
                          ) : (
                            <HeartIcon className="h-5 w-5 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{outfit.name}</h3>
                        <p className="text-sm text-primary-600 font-medium">{outfit.estimatedCost}</p>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">{outfit.styleNotes}</p>
                      </div>

                      <div className="mb-4 space-y-2">
                        <div>
                          <span className="font-medium text-sm">Items: </span>
                          <div className="text-sm text-gray-600 mt-1 space-y-1">
                            <div>• {outfit.items?.top}</div>
                            <div>• {outfit.items?.bottom}</div>
                            <div>• {outfit.items?.shoes}</div>
                            {outfit.items?.outerwear && <div>• {outfit.items.outerwear}</div>}
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium text-sm">Colors: </span>
                          <div className="flex gap-1 mt-1">
                            {outfit.colorScheme?.map((color, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs bg-gray-100 rounded"
                              >
                                {color}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium text-sm">Tags: </span>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {outfit.tags?.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {outfit.stylingTips && outfit.stylingTips.length > 0 && (
                          <div>
                            <span className="font-medium text-sm">Styling Tips: </span>
                            <ul className="text-sm text-gray-600 mt-1 space-y-1">
                              {outfit.stylingTips.slice(0, 2).map((tip, idx) => (
                                <li key={idx}>• {tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 btn-primary text-sm py-2 flex items-center justify-center">
                          <ShoppingCartIcon className="h-4 w-4 mr-1" />
                          Shop Items
                        </button>
                        <button className="flex-1 btn-secondary text-sm py-2">
                          Try On
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Generate More Button */}
            {!loading && outfits.length > 0 && (
              <div className="text-center mt-12">
                <button 
                  onClick={loadOutfitRecommendations}
                  className="btn-secondary flex items-center gap-2 mx-auto"
                >
                  <SparklesIcon className="h-5 w-5" />
                  Generate More Outfits
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && outfits.length === 0 && (
              <div className="text-center py-12">
                <SparklesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No outfits generated yet</h3>
                <p className="text-gray-600 mb-4">Click the button below to generate your first AI outfit recommendations!</p>
                <button 
                  onClick={loadOutfitRecommendations}
                  className="btn-primary"
                >
                  Generate Outfit Recommendations
                </button>
              </div>
            )}
          </>
        )}

        {/* Influencer Partnerships Tab */}
        {activeTab === 'influencers' && (
          <>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Style Influencers & Live Sessions</h2>
              <p className="text-gray-600">Connect with professional stylists and fashion influencers for personalized styling sessions</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {influencers.map((influencer, index) => (
                <motion.div
                  key={influencer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="text-center mb-4">
                    <img
                      src={influencer.avatar}
                      alt={influencer.name}
                      className="w-20 h-20 rounded-full mx-auto mb-3"
                    />
                    <h3 className="text-lg font-semibold text-gray-900">{influencer.name}</h3>
                    <p className="text-sm text-gray-500">{influencer.specialty}</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-sm text-gray-600">{influencer.followers} followers</span>
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{influencer.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 text-center">{influencer.bio}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Session Price:</span>
                      <span className="text-sm text-primary-600 font-semibold">{influencer.sessionPrice}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Availability:</span>
                      <span className="text-sm text-green-600">{influencer.availability}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => bookStylingSession(influencer.id)}
                    className="w-full btn-primary mt-4 flex items-center justify-center gap-2"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    Book Live Session
                  </button>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
