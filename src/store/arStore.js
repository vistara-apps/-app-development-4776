import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useARStore = create(
  persist(
    (set, get) => ({
      // AR Models State
      arModels: [],
      
      // Lighting Configuration
      lighting: {
        ambient: 0.4,
        directional: 0.8,
        point: 0.3,
        position: [5, 5, 5]
      },
      
      // AR Session State
      isARActive: false,
      currentSession: null,
      sessionHistory: [],
      
      // Performance Settings
      performance: {
        quality: 'medium', // 'low', 'medium', 'high'
        frameRate: 30,
        enableShadows: true,
        enableReflections: false,
        modelComplexity: 1 // 0-2
      },
      
      // User Preferences
      preferences: {
        autoSave: true,
        showPoseIndicators: true,
        enableHapticFeedback: false,
        defaultLighting: 'natural'
      },

      // Actions
      
      // Model Management
      addModel: (model) => {
        const newModel = {
          id: model.id || `model_${Date.now()}`,
          type: model.type || 'shirt',
          name: model.name || 'Untitled',
          color: model.color || '#4F46E5',
          texture: model.texture || null,
          position: model.position || [0, 0, 0],
          rotation: model.rotation || [0, 0, 0],
          scale: model.scale || [1, 1, 1],
          visible: model.visible !== false,
          opacity: model.opacity || 1,
          createdAt: Date.now(),
          ...model
        }
        
        set((state) => ({
          arModels: [...state.arModels, newModel]
        }))
        
        return newModel.id
      },
      
      removeModel: (modelId) => {
        set((state) => ({
          arModels: state.arModels.filter(model => model.id !== modelId)
        }))
      },
      
      updateModel: (modelId, updates) => {
        set((state) => ({
          arModels: state.arModels.map(model =>
            model.id === modelId
              ? { ...model, ...updates, updatedAt: Date.now() }
              : model
          )
        }))
      },
      
      clearModels: () => {
        set({ arModels: [] })
      },
      
      duplicateModel: (modelId) => {
        const state = get()
        const originalModel = state.arModels.find(m => m.id === modelId)
        
        if (originalModel) {
          const duplicatedModel = {
            ...originalModel,
            id: `model_${Date.now()}`,
            name: `${originalModel.name} (Copy)`,
            position: [
              originalModel.position[0] + 0.2,
              originalModel.position[1],
              originalModel.position[2]
            ],
            createdAt: Date.now()
          }
          
          return state.addModel(duplicatedModel)
        }
        
        return null
      },
      
      // Lighting Management
      updateLighting: (lightingUpdates) => {
        set((state) => ({
          lighting: { ...state.lighting, ...lightingUpdates }
        }))
      },
      
      setLightingPreset: (preset) => {
        const presets = {
          natural: { ambient: 0.4, directional: 0.8, point: 0.3 },
          studio: { ambient: 0.6, directional: 1.0, point: 0.5 },
          dramatic: { ambient: 0.2, directional: 1.2, point: 0.1 },
          soft: { ambient: 0.8, directional: 0.4, point: 0.6 }
        }
        
        if (presets[preset]) {
          set((state) => ({
            lighting: { ...state.lighting, ...presets[preset] }
          }))
        }
      },
      
      // Session Management
      startARSession: (sessionData = {}) => {
        const session = {
          id: `session_${Date.now()}`,
          startTime: Date.now(),
          models: [],
          lighting: get().lighting,
          screenshots: [],
          recordings: [],
          ...sessionData
        }
        
        set({
          isARActive: true,
          currentSession: session
        })
        
        return session.id
      },
      
      endARSession: () => {
        const state = get()
        
        if (state.currentSession) {
          const completedSession = {
            ...state.currentSession,
            endTime: Date.now(),
            duration: Date.now() - state.currentSession.startTime,
            finalModels: [...state.arModels],
            finalLighting: { ...state.lighting }
          }
          
          set((prevState) => ({
            isARActive: false,
            currentSession: null,
            sessionHistory: [completedSession, ...prevState.sessionHistory.slice(0, 9)] // Keep last 10 sessions
          }))
          
          return completedSession
        }
        
        set({ isARActive: false, currentSession: null })
        return null
      },
      
      saveSession: async (sessionData) => {
        const state = get()
        const session = {
          id: sessionData?.id || `session_${Date.now()}`,
          name: sessionData?.name || `AR Session ${new Date().toLocaleDateString()}`,
          models: [...state.arModels],
          lighting: { ...state.lighting },
          timestamp: Date.now(),
          ...sessionData
        }
        
        // In a real app, this would save to a backend
        // For now, we'll just add to session history
        set((prevState) => ({
          sessionHistory: [session, ...prevState.sessionHistory.slice(0, 19)] // Keep last 20 sessions
        }))
        
        return session
      },
      
      loadSession: (sessionId) => {
        const state = get()
        const session = state.sessionHistory.find(s => s.id === sessionId)
        
        if (session) {
          set({
            arModels: [...session.models],
            lighting: { ...session.lighting }
          })
          
          return session
        }
        
        return null
      },
      
      deleteSession: (sessionId) => {
        set((state) => ({
          sessionHistory: state.sessionHistory.filter(s => s.id !== sessionId)
        }))
      },
      
      // Screenshot/Recording Management
      addScreenshot: (screenshotData) => {
        const screenshot = {
          id: `screenshot_${Date.now()}`,
          timestamp: Date.now(),
          sessionId: get().currentSession?.id,
          ...screenshotData
        }
        
        set((state) => ({
          currentSession: state.currentSession ? {
            ...state.currentSession,
            screenshots: [...(state.currentSession.screenshots || []), screenshot]
          } : null
        }))
        
        return screenshot
      },
      
      addRecording: (recordingData) => {
        const recording = {
          id: `recording_${Date.now()}`,
          timestamp: Date.now(),
          sessionId: get().currentSession?.id,
          ...recordingData
        }
        
        set((state) => ({
          currentSession: state.currentSession ? {
            ...state.currentSession,
            recordings: [...(state.currentSession.recordings || []), recording]
          } : null
        }))
        
        return recording
      },
      
      // Performance Management
      updatePerformance: (performanceUpdates) => {
        set((state) => ({
          performance: { ...state.performance, ...performanceUpdates }
        }))
      },
      
      setQualityPreset: (quality) => {
        const qualityPresets = {
          low: {
            quality: 'low',
            frameRate: 24,
            enableShadows: false,
            enableReflections: false,
            modelComplexity: 0
          },
          medium: {
            quality: 'medium',
            frameRate: 30,
            enableShadows: true,
            enableReflections: false,
            modelComplexity: 1
          },
          high: {
            quality: 'high',
            frameRate: 60,
            enableShadows: true,
            enableReflections: true,
            modelComplexity: 2
          }
        }
        
        if (qualityPresets[quality]) {
          set((state) => ({
            performance: { ...state.performance, ...qualityPresets[quality] }
          }))
        }
      },
      
      // Preferences Management
      updatePreferences: (preferenceUpdates) => {
        set((state) => ({
          preferences: { ...state.preferences, ...preferenceUpdates }
        }))
      },
      
      // Utility Functions
      getModelById: (modelId) => {
        return get().arModels.find(model => model.id === modelId)
      },
      
      getModelsByType: (type) => {
        return get().arModels.filter(model => model.type === type)
      },
      
      getVisibleModels: () => {
        return get().arModels.filter(model => model.visible !== false)
      },
      
      getSessionStats: () => {
        const state = get()
        const currentSession = state.currentSession
        
        if (!currentSession) return null
        
        return {
          duration: Date.now() - currentSession.startTime,
          modelCount: state.arModels.length,
          screenshotCount: currentSession.screenshots?.length || 0,
          recordingCount: currentSession.recordings?.length || 0
        }
      },
      
      exportSession: (sessionId) => {
        const state = get()
        const session = sessionId 
          ? state.sessionHistory.find(s => s.id === sessionId)
          : state.currentSession
        
        if (!session) return null
        
        return {
          version: '1.0',
          exportedAt: Date.now(),
          session: {
            ...session,
            models: session.models || state.arModels,
            lighting: session.lighting || state.lighting
          }
        }
      },
      
      importSession: (sessionData) => {
        if (!sessionData || !sessionData.session) return false
        
        const session = sessionData.session
        
        set({
          arModels: session.models || [],
          lighting: session.lighting || get().lighting
        })
        
        return true
      },
      
      // Reset Functions
      resetToDefaults: () => {
        set({
          arModels: [],
          lighting: {
            ambient: 0.4,
            directional: 0.8,
            point: 0.3,
            position: [5, 5, 5]
          },
          performance: {
            quality: 'medium',
            frameRate: 30,
            enableShadows: true,
            enableReflections: false,
            modelComplexity: 1
          }
        })
      },
      
      clearHistory: () => {
        set({ sessionHistory: [] })
      }
    }),
    {
      name: 'ar-store',
      partialize: (state) => ({
        // Only persist certain parts of the state
        lighting: state.lighting,
        performance: state.performance,
        preferences: state.preferences,
        sessionHistory: state.sessionHistory.slice(0, 10) // Only keep last 10 sessions
      })
    }
  )
)

export default useARStore
