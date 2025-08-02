import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { CameraIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import { handleError } from '../utils/errorHandling'

export default function Profile() {
  const { user, profile, updateProfile, bodyMeasurements, setBodyMeasurements, subscription } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  // Update form when profile data loads
  useEffect(() => {
    if (user && profile) {
      reset({
        full_name: profile?.full_name || '',
        email: user?.email || '',
        height: bodyMeasurements?.height || '',
        weight: bodyMeasurements?.weight || '',
        chest: bodyMeasurements?.chest || '',
        waist: bodyMeasurements?.waist || '',
        hips: bodyMeasurements?.hips || ''
      })
    }
  }, [user, profile, bodyMeasurements, reset])

  const onSubmitProfile = async (data) => {
    setIsLoading(true)
    try {
      await updateProfile({
        full_name: data.full_name,
        email: data.email
      })
      toast.success('Profile updated successfully!')
    } catch (error) {
      handleError(error, 'Profile update')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitMeasurements = async (data) => {
    setIsLoading(true)
    try {
      const measurements = {
        height: data.height,
        weight: data.weight,
        chest: data.chest,
        waist: data.waist,
        hips: data.hips
      }
      await setBodyMeasurements(measurements)
      toast.success('Body measurements updated successfully!')
    } catch (error) {
      handleError(error, 'Measurements update')
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile' },
    { id: 'measurements', name: 'Body Measurements' },
    { id: 'preferences', name: 'Style Preferences' },
    { id: 'subscription', name: 'Subscription' }
  ]

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Profile Settings
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Manage your account preferences and measurements
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="card p-8">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-semibold mb-6">Profile Information</h2>
              
              <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
                      <CameraIcon className="h-8 w-8 text-gray-500" />
                    </div>
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 bg-primary-600 rounded-full p-2 text-white hover:bg-primary-700"
                    >
                      <CameraIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    {...register('full_name', { required: 'Name is required' })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  {errors.full_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === 'measurements' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-semibold mb-6">Body Measurements</h2>
              <p className="text-gray-600 mb-6">
                Accurate measurements help us provide better fit recommendations and virtual try-on results.
              </p>

              <form onSubmit={handleSubmit(onSubmitMeasurements)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      {...register('height', { 
                        required: 'Height is required',
                        min: { value: 120, message: 'Please enter a valid height' },
                        max: { value: 250, message: 'Please enter a valid height' }
                      })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                    {errors.height && (
                      <p className="mt-1 text-sm text-red-600">{errors.height.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      {...register('weight')}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chest/Bust (cm)
                    </label>
                    <input
                      type="number"
                      {...register('chest')}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Waist (cm)
                    </label>
                    <input
                      type="number"
                      {...register('waist')}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hips (cm)
                    </label>
                    <input
                      type="number"
                      {...register('hips')}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Updating...' : 'Update Measurements'}
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === 'preferences' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-semibold mb-6">Style Preferences</h2>
              <p className="text-gray-600 mb-6">
                Help us understand your style to provide better recommendations.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preferred Style
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Casual', 'Business', 'Elegant', 'Sporty', 'Trendy', 'Classic'].map((style) => (
                      <label key={style} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-900">{style}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preferred Colors
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {['Black', 'White', 'Navy', 'Gray', 'Red', 'Blue', 'Green', 'Pink'].map((color) => (
                      <label key={color} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-900">{color}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range (per item)
                  </label>
                  <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    <option>Under $50</option>
                    <option>$50 - $100</option>
                    <option>$100 - $200</option>
                    <option>$200+</option>
                  </select>
                </div>

                <button className="btn-primary">
                  Save Preferences
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'subscription' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-semibold mb-6">Subscription</h2>
              
              {subscription ? (
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 capitalize">
                          {subscription.plan} Plan
                        </h3>
                        <p className="text-gray-600">
                          {subscription.plan === 'free' ? 'Free trial' : 
                           subscription.plan === 'basic' ? '$9.99/month' : '$19.99/month'}
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Active
                      </span>
                    </div>
                  </div>

                  {subscription.plan !== 'pro' && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Upgrade Your Plan</h4>
                      <p className="text-gray-600 mb-4">
                        Get more features and unlimited access with our Pro plan.
                      </p>
                      <a href="/pricing" className="btn-primary">
                        View Pricing Plans
                      </a>
                    </div>
                  )}

                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Billing Information</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Next billing date: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toDateString()}</p>
                      <p>Payment method: •••• •••• •••• 4242</p>
                    </div>
                    <button className="btn-secondary mt-3">
                      Update Payment Method
                    </button>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Cancel Subscription</h4>
                    <p className="text-gray-600 mb-4">
                      You can cancel your subscription at any time. Your access will continue until the end of your current billing period.
                    </p>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">You don't have an active subscription.</p>
                  <a href="/pricing" className="btn-primary">
                    Choose a Plan
                  </a>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
