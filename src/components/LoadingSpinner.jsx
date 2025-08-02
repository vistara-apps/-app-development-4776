import { motion } from 'framer-motion'

export default function LoadingSpinner({ size = 'md', text = 'Loading...', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    large: 'w-12 h-12',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const borderClasses = {
    sm: 'border-2',
    md: 'border-4',
    large: 'border-4', 
    lg: 'border-4',
    xl: 'border-4'
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-[200px] space-y-4 ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} ${borderClasses[size]} border-primary-200 border-t-primary-600 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-neutral-600 text-sm font-medium"
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}