// Social sharing utilities for different platforms

export const SOCIAL_PLATFORMS = {
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  INSTAGRAM: 'instagram',
  LINKEDIN: 'linkedin',
  WHATSAPP: 'whatsapp',
  PINTEREST: 'pinterest'
}

// Generate sharing URLs for different platforms
export const generateShareUrl = (platform, options = {}) => {
  const { url, text, image, hashtags = [] } = options
  const encodedUrl = encodeURIComponent(url || window.location.href)
  const encodedText = encodeURIComponent(text || '')
  const encodedImage = encodeURIComponent(image || '')
  const hashtagString = hashtags.map(tag => `#${tag}`).join(' ')

  const shareUrls = {
    [SOCIAL_PLATFORMS.FACEBOOK]: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    
    [SOCIAL_PLATFORMS.TWITTER]: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=${hashtags.join(',')}`,
    
    [SOCIAL_PLATFORMS.LINKEDIN]: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    
    [SOCIAL_PLATFORMS.WHATSAPP]: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    
    [SOCIAL_PLATFORMS.PINTEREST]: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedText}`,
    
    // Instagram doesn't support direct URL sharing, so we'll use a fallback
    [SOCIAL_PLATFORMS.INSTAGRAM]: null
  }

  return shareUrls[platform]
}

// Generate sharing content based on virtual try-on result
export const generateSharingContent = (result, product) => {
  const confidence = Math.round(result.confidence * 100)
  
  const content = {
    text: `Just tried on ${product?.name || 'this amazing outfit'} virtually! ${confidence}% match confidence. Check out this AI-powered virtual try-on experience! 🔥✨`,
    hashtags: ['VirtualTryOn', 'AI', 'Fashion', 'TechFashion', 'StyleTech'],
    url: window.location.href,
    image: result.image
  }

  return content
}

// Check if Web Share API is supported (for mobile devices)
export const isWebShareSupported = () => {
  return 'share' in navigator
}

// Use native Web Share API if available
export const shareWithWebAPI = async (content) => {
  if (!isWebShareSupported()) {
    throw new Error('Web Share API not supported')
  }

  try {
    await navigator.share({
      title: 'Virtual Try-On Result',
      text: content.text,
      url: content.url
    })
    return { success: true }
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, cancelled: true }
    }
    throw error
  }
}

// Open sharing URL in a new window
export const openShareWindow = (url, platform) => {
  if (!url) {
    throw new Error(`Sharing not supported for ${platform}`)
  }

  const windowFeatures = 'width=600,height=400,scrollbars=yes,resizable=yes'
  const shareWindow = window.open(url, `share-${platform}`, windowFeatures)
  
  if (!shareWindow) {
    throw new Error('Popup blocked. Please allow popups for sharing.')
  }

  return shareWindow
}

// Copy content to clipboard as fallback
export const copyToClipboard = async (content) => {
  const textToCopy = `${content.text}\n\n${content.url}`
  
  try {
    await navigator.clipboard.writeText(textToCopy)
    return { success: true }
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = textToCopy
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return { success: true }
    } catch (fallbackError) {
      document.body.removeChild(textArea)
      throw new Error('Failed to copy to clipboard')
    }
  }
}

// Main sharing function that handles different methods
export const shareContent = async (platform, content) => {
  try {
    // For mobile devices, try Web Share API first
    if (isWebShareSupported() && platform === 'native') {
      return await shareWithWebAPI(content)
    }

    // For Instagram, copy to clipboard since direct sharing isn't supported
    if (platform === SOCIAL_PLATFORMS.INSTAGRAM) {
      await copyToClipboard(content)
      return { 
        success: true, 
        message: 'Content copied to clipboard! You can now paste it in Instagram.' 
      }
    }

    // For other platforms, open sharing URL
    const shareUrl = generateShareUrl(platform, content)
    openShareWindow(shareUrl, platform)
    
    return { success: true }
  } catch (error) {
    console.error('Sharing error:', error)
    throw error
  }
}

// Platform configurations for UI display
export const PLATFORM_CONFIG = {
  [SOCIAL_PLATFORMS.FACEBOOK]: {
    name: 'Facebook',
    icon: '📘',
    color: '#1877F2',
    bgColor: 'bg-blue-500'
  },
  [SOCIAL_PLATFORMS.TWITTER]: {
    name: 'Twitter',
    icon: '🐦',
    color: '#1DA1F2',
    bgColor: 'bg-sky-500'
  },
  [SOCIAL_PLATFORMS.INSTAGRAM]: {
    name: 'Instagram',
    icon: '📷',
    color: '#E4405F',
    bgColor: 'bg-pink-500'
  },
  [SOCIAL_PLATFORMS.LINKEDIN]: {
    name: 'LinkedIn',
    icon: '💼',
    color: '#0A66C2',
    bgColor: 'bg-blue-600'
  },
  [SOCIAL_PLATFORMS.WHATSAPP]: {
    name: 'WhatsApp',
    icon: '💬',
    color: '#25D366',
    bgColor: 'bg-green-500'
  },
  [SOCIAL_PLATFORMS.PINTEREST]: {
    name: 'Pinterest',
    icon: '📌',
    color: '#BD081C',
    bgColor: 'bg-red-500'
  }
}

