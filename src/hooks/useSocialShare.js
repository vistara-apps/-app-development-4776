import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { 
  shareContent, 
  generateSharingContent, 
  isWebShareSupported,
  SOCIAL_PLATFORMS 
} from '../utils/socialSharing'

export const useSocialShare = () => {
  const [isSharing, setIsSharing] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)

  const share = async (platform, result, product) => {
    setIsSharing(true)
    
    try {
      const content = generateSharingContent(result, product)
      const shareResult = await shareContent(platform, content)
      
      if (shareResult.success) {
        if (shareResult.message) {
          toast.success(shareResult.message)
        } else if (!shareResult.cancelled) {
          toast.success('Shared successfully!')
        }
      }
      
      return shareResult
    } catch (error) {
      console.error('Share error:', error)
      toast.error(error.message || 'Failed to share content')
      return { success: false, error }
    } finally {
      setIsSharing(false)
    }
  }

  const shareNative = async (result, product) => {
    return await share('native', result, product)
  }

  const shareTo = async (platform, result, product) => {
    return await share(platform, result, product)
  }

  const openShareModal = () => setShareModalOpen(true)
  const closeShareModal = () => setShareModalOpen(false)

  return {
    isSharing,
    shareModalOpen,
    share,
    shareNative,
    shareTo,
    openShareModal,
    closeShareModal,
    isWebShareSupported: isWebShareSupported(),
    platforms: SOCIAL_PLATFORMS
  }
}

export default useSocialShare

