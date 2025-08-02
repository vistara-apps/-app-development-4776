import { toast } from 'react-hot-toast'

// Error types
export const ERROR_TYPES = {
  AUTHENTICATION: 'authentication',
  NETWORK: 'network',
  VALIDATION: 'validation',
  AI_API: 'ai_api',
  SHARING: 'sharing',
  UNKNOWN: 'unknown'
}

// Error classification
export const classifyError = (error) => {
  if (!error) return ERROR_TYPES.UNKNOWN

  const message = error.message?.toLowerCase() || ''
  
  if (message.includes('auth') || message.includes('login') || message.includes('unauthorized')) {
    return ERROR_TYPES.AUTHENTICATION
  }
  
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return ERROR_TYPES.NETWORK
  }
  
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return ERROR_TYPES.VALIDATION
  }
  
  if (message.includes('ai') || message.includes('generation') || message.includes('processing')) {
    return ERROR_TYPES.AI_API
  }
  
  if (message.includes('share') || message.includes('social')) {
    return ERROR_TYPES.SHARING
  }
  
  return ERROR_TYPES.UNKNOWN
}

// User-friendly error messages
export const getErrorMessage = (error, type = null) => {
  const errorType = type || classifyError(error)
  
  const messages = {
    [ERROR_TYPES.AUTHENTICATION]: {
      title: 'Authentication Error',
      message: 'Please sign in to continue. If you\'re already signed in, try refreshing the page.',
      action: 'Sign In'
    },
    [ERROR_TYPES.NETWORK]: {
      title: 'Connection Error',
      message: 'Please check your internet connection and try again.',
      action: 'Retry'
    },
    [ERROR_TYPES.VALIDATION]: {
      title: 'Invalid Input',
      message: 'Please check your input and try again.',
      action: 'Fix Input'
    },
    [ERROR_TYPES.AI_API]: {
      title: 'Processing Error',
      message: 'We\'re having trouble processing your request. Please try again in a moment.',
      action: 'Try Again'
    },
    [ERROR_TYPES.SHARING]: {
      title: 'Sharing Error',
      message: 'Unable to share content. Please try a different platform or copy the link manually.',
      action: 'Try Again'
    },
    [ERROR_TYPES.UNKNOWN]: {
      title: 'Something went wrong',
      message: 'An unexpected error occurred. Please try again.',
      action: 'Try Again'
    }
  }
  
  return messages[errorType] || messages[ERROR_TYPES.UNKNOWN]
}

// Enhanced error handler with retry logic
export class ErrorHandler {
  constructor() {
    this.retryAttempts = new Map()
    this.maxRetries = 3
  }

  async handleError(error, context = {}, options = {}) {
    const { 
      showToast = true, 
      allowRetry = false, 
      retryFn = null,
      customMessage = null 
    } = options
    
    const errorType = classifyError(error)
    const errorInfo = getErrorMessage(error, errorType)
    
    // Log error for debugging
    console.error(`[${errorType.toUpperCase()}] ${context.action || 'Error'}:`, {
      error,
      context,
      timestamp: new Date().toISOString()
    })
    
    // Show user-friendly toast notification
    if (showToast) {
      const message = customMessage || errorInfo.message
      toast.error(message, {
        duration: errorType === ERROR_TYPES.NETWORK ? 5000 : 4000,
        id: `error-${errorType}-${Date.now()}`
      })
    }
    
    // Handle retry logic
    if (allowRetry && retryFn && this.shouldRetry(context.action, errorType)) {
      const retryKey = context.action || 'unknown'
      const attempts = this.retryAttempts.get(retryKey) || 0
      
      if (attempts < this.maxRetries) {
        this.retryAttempts.set(retryKey, attempts + 1)
        
        // Exponential backoff
        const delay = Math.pow(2, attempts) * 1000
        
        toast.loading(`Retrying... (${attempts + 1}/${this.maxRetries})`, {
          id: `retry-${retryKey}`,
          duration: delay
        })
        
        setTimeout(async () => {
          try {
            await retryFn()
            this.retryAttempts.delete(retryKey)
            toast.dismiss(`retry-${retryKey}`)
          } catch (retryError) {
            await this.handleError(retryError, context, { ...options, allowRetry: false })
          }
        }, delay)
        
        return { handled: true, retrying: true }
      } else {
        this.retryAttempts.delete(retryKey)
        toast.error(`Failed after ${this.maxRetries} attempts. Please try again later.`)
      }
    }
    
    return { 
      handled: true, 
      retrying: false, 
      errorType, 
      errorInfo 
    }
  }
  
  shouldRetry(action, errorType) {
    // Only retry network and AI API errors
    return [ERROR_TYPES.NETWORK, ERROR_TYPES.AI_API].includes(errorType)
  }
  
  clearRetryAttempts(action) {
    if (action) {
      this.retryAttempts.delete(action)
    } else {
      this.retryAttempts.clear()
    }
  }
}

// Global error handler instance
export const globalErrorHandler = new ErrorHandler()

// Convenience functions
export const handleAuthError = (error, context = {}) => {
  return globalErrorHandler.handleError(error, { ...context, action: 'authentication' })
}

export const handleNetworkError = (error, context = {}, retryFn = null) => {
  return globalErrorHandler.handleError(error, { ...context, action: 'network' }, {
    allowRetry: !!retryFn,
    retryFn
  })
}

export const handleAIError = (error, context = {}, retryFn = null) => {
  return globalErrorHandler.handleError(error, { ...context, action: 'ai_generation' }, {
    allowRetry: !!retryFn,
    retryFn
  })
}

export const handleSharingError = (error, context = {}) => {
  return globalErrorHandler.handleError(error, { ...context, action: 'sharing' })
}

// React hook for error handling
export const useErrorHandler = () => {
  const handleError = (error, context = {}, options = {}) => {
    return globalErrorHandler.handleError(error, context, options)
  }
  
  const clearRetries = (action) => {
    globalErrorHandler.clearRetryAttempts(action)
  }
  
  return { handleError, clearRetries }
}

export default globalErrorHandler

