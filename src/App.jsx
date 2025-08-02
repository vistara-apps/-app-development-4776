import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import VirtualTryOn from './pages/VirtualTryOn'
import Recommendations from './pages/Recommendations'
import Profile from './pages/Profile'
import Pricing from './pages/Pricing'
import Login from './pages/Login'
import Register from './pages/Register'
import useAuth from './hooks/useAuth'

function App() {
  // Initialize authentication
  useAuth()

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/try-on" 
              element={
                <ProtectedRoute requireSubscription={true}>
                  <VirtualTryOn />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recommendations" 
              element={
                <ProtectedRoute>
                  <Recommendations />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
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
    </ErrorBoundary>
  )
}

export default App
