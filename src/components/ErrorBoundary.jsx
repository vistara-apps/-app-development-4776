import React from 'react'
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
    
    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="card-elevated p-8 text-center">
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
              </div>
              
              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-8 text-left">
                  <summary className="cursor-pointer text-sm text-neutral-500 hover:text-neutral-700">
                    Show error details (Development only)
                  </summary>
                  <div className="mt-4 p-4 bg-neutral-100 rounded-lg text-xs font-mono text-neutral-700 overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                    </div>
                    <div>
                      <strong>Stack trace:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    // If no error, render children normally
    return this.props.children
  }
}

export default ErrorBoundary

