import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ShareIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { SOCIAL_PLATFORMS, PLATFORM_CONFIG } from '../utils/socialSharing'

export default function SocialShareModal({ 
  isOpen, 
  onClose, 
  onShare, 
  isSharing, 
  result, 
  product,
  isWebShareSupported 
}) {
  const handlePlatformShare = (platform) => {
    onShare(platform, result, product)
  }

  const handleNativeShare = () => {
    onShare('native', result, product)
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900 flex items-center"
                  >
                    <ShareIcon className="h-5 w-5 mr-2 text-primary-600" />
                    Share Your Try-On
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Preview */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <img
                      src={result.image}
                      alt="Try-on result"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {product?.name || 'Virtual Try-On Result'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round(result.confidence * 100)}% match confidence
                      </p>
                    </div>
                  </div>
                </div>

                {/* Native Share (Mobile) */}
                {isWebShareSupported && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                  >
                    <button
                      onClick={handleNativeShare}
                      disabled={isSharing}
                      className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 disabled:opacity-50"
                    >
                      <ShareIcon className="h-5 w-5 mr-2" />
                      {isSharing ? 'Sharing...' : 'Share with System'}
                    </button>
                  </motion.div>
                )}

                {/* Platform Options */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Or choose a platform:
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(SOCIAL_PLATFORMS).map(([key, platform]) => {
                      const config = PLATFORM_CONFIG[platform]
                      return (
                        <motion.button
                          key={platform}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * Object.keys(SOCIAL_PLATFORMS).indexOf(key) }}
                          onClick={() => handlePlatformShare(platform)}
                          disabled={isSharing}
                          className={`flex items-center justify-center px-4 py-3 ${config.bgColor} text-white rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 group`}
                        >
                          <span className="text-lg mr-2">{config.icon}</span>
                          <span className="text-sm font-medium">{config.name}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* Tips */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-700">
                    💡 <strong>Tip:</strong> For Instagram, we'll copy the content to your clipboard so you can paste it in your story or post!
                  </p>
                </div>

                {/* Close Button */}
                <div className="mt-6">
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

