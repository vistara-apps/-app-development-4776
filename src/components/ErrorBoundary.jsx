import React from 'react'
import { motion } from 'framer-motion'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and any error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })
    
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error, errorInfo)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI combining both approaches
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center"
          >
            <div className="bg-white rounded-2xl shadow-soft p-8">
              <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-neutral-900 mb-4">
                Oops! Something went wrong
              </h1>
              
              <p className="text-neutral-600 mb-8">
                We're sorry, but something unexpected happened. Our team has been notified and is working on a fix.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={this.handleReload}
                  className="btn-primary w-full"
                >
                  Reload Page
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="btn-secondary w-full"
                >
                  Go to Home
                </button>
                
                <button
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                  className="btn-secondary w-full"
                >
                  Try Again
                </button>
              </div>
              
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="text-sm text-neutral-500 cursor-pointer">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-4 bg-red-50 rounded-lg">
                    <pre className="text-xs text-red-600 overflow-auto">
                      {this.state.error.toString()}
                      {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          </motion.div>
        </div>
      )
    }

    // If no error, render children normally
    return this.props.children
  }
}

export default ErrorBoundary