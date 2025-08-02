import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import VirtualTryOn from './pages/VirtualTryOn'
import Recommendations from './pages/Recommendations'
import Profile from './pages/Profile'
import Pricing from './pages/Pricing'
import Login from './pages/Login'
import Register from './pages/Register'
import useAuthStore from './store/authStore'
import { AuthService } from './services/auth'

function App() {
  const { initialize, isInitialized, isLoading } = useAuthStore()

  useEffect(() => {
    // Initialize auth state on app load
    initialize()

    // Listen for auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange((event, userData) => {
      if (event === 'SIGNED_IN' && userData) {
        useAuthStore.setState({
          user: userData.user,
          profile: userData.profile,
          session: userData.session,
          subscription: userData.subscription,
          isAuthenticated: true
        })
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.setState({
          user: null,
          profile: null,
          session: null,
          subscription: null,
          isAuthenticated: false
        })
      }
    })

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe()
    }
  }, [initialize])

  // Show loading spinner while initializing auth
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 border-4 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/try-on" element={<VirtualTryOn />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
  )
}

export default App
