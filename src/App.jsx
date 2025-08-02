import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import LoadingSpinner from './components/LoadingSpinner'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import VirtualTryOn from './pages/VirtualTryOn'
import Recommendations from './pages/Recommendations'
import OutfitRecommendations from './pages/OutfitRecommendations'
import Profile from './pages/Profile'
import Pricing from './pages/Pricing'
import Login from './pages/Login'
import Register from './pages/Register'
import Wardrobe from './pages/Wardrobe'
import useAuthStore from './store/authStore'

function App() {
  // Initialize authentication
  useAuth()
  
  const { isInitialized, isLoading } = useAuth()

  // Show loading spinner while initializing auth
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Initializing..." />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pricing" element={<Pricing />} />
            
            {/* Protected Routes */}
            <Route path="/try-on" element={
              <ProtectedRoute requireSubscription={true}>
                <VirtualTryOn />
              </ProtectedRoute>
            } />
            <Route path="/wardrobe" element={
              <ProtectedRoute>
                <Wardrobe />
              </ProtectedRoute>
            } />
            <Route path="/recommendations" element={
              <ProtectedRoute>
                <Recommendations />
              </ProtectedRoute>
            } />
            <Route path="/outfits" element={
              <ProtectedRoute>
                <OutfitRecommendations />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'bg-white shadow-large border border-neutral-200',
            style: {
              borderRadius: '12px',
              padding: '16px',
            },
          }}
        />
      </div>
    </ErrorBoundary>
  )
}

export default App
