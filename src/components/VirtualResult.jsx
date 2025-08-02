import { motion } from 'framer-motion'
import { StarIcon, ShareIcon } from '@heroicons/react/24/solid'
import useSocialShare from '../hooks/useSocialShare'
import SocialShareModal from './SocialShareModal'
import useTryOnStore from '../store/tryOnStore'

export default function VirtualResult({ result }) {
  const { selectedProduct } = useTryOnStore()
  const {
    isSharing,
    shareModalOpen,
    shareTo,
    openShareModal,
    closeShareModal,
    isWebShareSupported
  } = useSocialShare()
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <h2 className="text-2xl font-semibold mb-6">Your Virtual Try-On Result</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Result Image */}
        <div>
          <div className="relative">
            <img
              src={result.image}
              alt="Virtual try-on result"
              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
            />
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {Math.round(result.confidence * 100)}% Match
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="text-left">
          <h3 className="text-xl font-semibold mb-4">Fit Analysis</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">Overall Fit</h4>
              <p className="text-gray-600">{result.feedback.fit}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Style Assessment</h4>
              <p className="text-gray-600">{result.feedback.style}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Recommendations</h4>
              <ul className="space-y-2">
                {result.feedback.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <StarIcon className="h-4 w-4 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button className="btn-primary w-full">
              Add to Cart
            </button>
            <button className="btn-secondary w-full">
              Try Another Product
            </button>
            <button 
              onClick={openShareModal}
              disabled={isSharing}
              className="btn-secondary w-full flex items-center justify-center group disabled:opacity-50"
            >
              <ShareIcon className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
              {isSharing ? 'Sharing...' : 'Share Result'}
            </button>
          </div>
        </div>
      </div>

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={shareModalOpen}
        onClose={closeShareModal}
        onShare={shareTo}
        isSharing={isSharing}
        result={result}
        product={selectedProduct}
        isWebShareSupported={isWebShareSupported}
      />
    </motion.div>
  )
}
