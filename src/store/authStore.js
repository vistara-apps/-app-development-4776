import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  subscription: null,
  bodyMeasurements: null,
  
  login: (user) => set({ 
    user, 
    isAuthenticated: true,
    subscription: user.subscription || null 
  }),
  
  logout: () => set({ 
    user: null, 
    isAuthenticated: false, 
    subscription: null,
    bodyMeasurements: null 
  }),
  
  updateProfile: (updates) => set((state) => ({
    user: { ...state.user, ...updates }
  })),
  
  setBodyMeasurements: (measurements) => set({ bodyMeasurements: measurements }),
  
  setSubscription: (subscription) => set({ subscription })
}))

export default useAuthStore