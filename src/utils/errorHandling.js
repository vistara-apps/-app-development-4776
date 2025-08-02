import { toast } from 'react-hot-toast'

// Error types
export const ERROR_TYPES = {
  AUTH: 'AUTH',
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  AI_SERVICE: 'AI_SERVICE',
  SUBSCRIPTION: 'SUBSCRIPTION',
  UNKNOWN: 'UNKNOWN'
}

// Classify error type based on error message/code
export const classifyError = (error) => {
  const message = error.message?.toLowerCase() || ''
  const code = error.code?.toLowerCase() || ''

  if (message.includes('auth') || message.includes('unauthorized') || message.includes('token')) {
    return ERROR_TYPES.AUTH
  }
  
  if (message.includes('network') || message.includes('fetch') || code.includes('network')) {
    return ERROR_TYPES.NETWORK
  }
  
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return ERROR_TYPES.VALIDATION
  }
  
  if (message.includes('api key') || message.includes('quota') || message.includes('billing')) {
    return ERROR_TYPES.AI_SERVICE
  }
  
  if (message.includes('subscription') || message.includes('plan') || message.includes('upgrade')) {
    return ERROR_TYPES.SUBSCRIPTION
  }
  
  return ERROR_TYPES.UNKNOWN
}

// Get user-friendly error message
export const getErrorMessage = (error, context = '') => {
  const errorType = classifyError(error)
  const contextPrefix = context ? `${context}: ` : ''

  switch (errorType) {
    case ERROR_TYPES.AUTH:
      return `${contextPrefix}Authentication failed. Please sign in again.`
    
    case ERROR_TYPES.NETWORK:
      return `${contextPrefix}Network error. Please check your connection and try again.`
    
    case ERROR_TYPES.VALIDATION:
      return `${contextPrefix}Please check your input and try again.`
    
    case ERROR_TYPES.AI_SERVICE:
      if (error.message.includes('API key')) {
        return `${contextPrefix}AI service not configured. Please contact support.`
      }
      if (error.message.includes('quota') || error.message.includes('billing')) {
        return `${contextPrefix}AI service temporarily unavailable. Please try again later.`
      }
      return `${contextPrefix}AI service error. Please try again.`
    
    case ERROR_TYPES.SUBSCRIPTION:
      return `${contextPrefix}Please upgrade your subscription to access this feature.`
    
    default:
      return `${contextPrefix}${error.message || 'An unexpected error occurred. Please try again.'}`
  }
}

// Handle error with appropriate user feedback
export const handleError = (error, context = '', options = {}) => {
  const { 
    showToast = true, 
    logError = true,
    fallbackMessage = 'Something went wrong. Please try again.'
  } = options

  if (logError) {
    console.error(`Error in ${context}:`, error)
  }

  const message = getErrorMessage(error, context) || fallbackMessage

  if (showToast) {
    toast.error(message)
  }

  return {
    type: classifyError(error),
    message,
    originalError: error
  }
}

// Async error wrapper
export const withErrorHandling = (asyncFn, context = '') => {
  return async (...args) => {
    try {
      return await asyncFn(...args)
    } catch (error) {
      handleError(error, context)
      throw error
    }
  }
}

// Retry logic for failed operations
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries) {
        throw error
      }

      // Don't retry certain error types
      const errorType = classifyError(error)
      if (errorType === ERROR_TYPES.AUTH || errorType === ERROR_TYPES.VALIDATION) {
        throw error
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }

  throw lastError
}

// Validation helpers
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw new Error(`${fieldName} is required`)
  }
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('Please enter a valid email address')
  }
}

export const validatePassword = (password) => {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  }
}

