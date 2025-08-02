// Environment configuration with validation
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_APP_URL'
]

const optionalEnvVars = [
  'VITE_AI_API_URL',
  'VITE_AI_API_KEY'
]

// Validate required environment variables
const validateEnv = () => {
  const missing = requiredEnvVars.filter(envVar => !import.meta.env[envVar])
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing)
    console.error('Please check your .env.local file and ensure all required variables are set.')
    return false
  }
  
  return true
}

// Environment configuration object
export const env = {
  // Supabase
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  
  // AI API
  AI_API_URL: import.meta.env.VITE_AI_API_URL,
  AI_API_KEY: import.meta.env.VITE_AI_API_KEY,
  
  // App
  APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  
  // Development
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
}

// Validate environment on module load
if (!validateEnv()) {
  throw new Error('Environment validation failed. Please check your environment variables.')
}

export default env

