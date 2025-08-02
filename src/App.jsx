import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import VirtualTryOn from './pages/VirtualTryOn'
import ARTryOn from './pages/ARTryOn'
import Recommendations from './pages/Recommendations'
import Profile from './pages/Profile'
import Pricing from './pages/Pricing'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/try-on" element={<VirtualTryOn />} />
          <Route path="/ar-try-on" element={<ARTryOn />} />
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
