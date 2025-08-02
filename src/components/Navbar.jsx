import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import useAuthStore from '../store/authStore'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Virtual Try-On', href: '/try-on' },
  { name: 'Recommendations', href: '/recommendations' },
  { name: 'Pricing', href: '/pricing' }
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, user, profile, logout } = useAuth()
  const { signOut } = useAuthStore()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-soft border-b border-neutral-200/50">
      <nav className="container-custom" aria-label="Top">
        <div className="flex w-full items-center justify-between py-4">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-display font-bold text-gradient hover:scale-105 transition-transform duration-200">
              TryOn.ai
            </Link>
          </div>
          
          <div className="hidden md:flex md:space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-neutral-700 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-neutral-700 hover:text-primary-600 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-semibold">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <span>{profile?.full_name || user?.email}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-secondary btn-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-neutral-700 hover:text-primary-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-neutral-50 transition-all duration-200">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary btn-sm">
                  Sign up
                </Link>
              </>
            )}
          </div>

          <div className="flex md:hidden">
            <button
              type="button"
              className="text-neutral-700 hover:text-primary-600 p-2 rounded-xl hover:bg-neutral-50 transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden animate-slide-down">
            <div className="card mx-4 mb-4 p-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-4 py-3 text-neutral-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl text-sm font-medium transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-neutral-200 pt-4 mt-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-3 text-neutral-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl text-sm font-medium transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-semibold">
                        {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </div>
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-3 text-neutral-700 hover:text-error-600 hover:bg-error-50 rounded-xl text-sm font-medium transition-all duration-200"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-3 text-neutral-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl text-sm font-medium transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-3 text-center bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-sm font-medium shadow-soft hover:shadow-medium transition-all duration-200 mt-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
