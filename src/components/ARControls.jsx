import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  XMarkIcon, 
  SunIcon, 
  AdjustmentsHorizontalIcon,
  SwatchIcon,
  ArrowsPointingOutIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export default function ARControls({ 
  models = [], 
  lighting = {}, 
  onUpdateModel, 
  onUpdateLighting, 
  onClose 
}) {
  const [activeTab, setActiveTab] = useState('models')
  const [selectedModelId, setSelectedModelId] = useState(models[0]?.id || null)

  const selectedModel = models.find(m => m.id === selectedModelId)

  // Handle model position changes
  const handlePositionChange = (axis, value) => {
    if (!selectedModel) return
    
    const newPosition = [...selectedModel.position]
    const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
    newPosition[axisIndex] = parseFloat(value)
    
    onUpdateModel(selectedModel.id, { position: newPosition })
  }

  // Handle model rotation changes
  const handleRotationChange = (axis, value) => {
    if (!selectedModel) return
    
    const newRotation = [...selectedModel.rotation]
    const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
    newRotation[axisIndex] = parseFloat(value) * (Math.PI / 180) // Convert to radians
    
    onUpdateModel(selectedModel.id, { rotation: newRotation })
  }

  // Handle model scale changes
  const handleScaleChange = (value) => {
    if (!selectedModel) return
    
    const scale = parseFloat(value)
    onUpdateModel(selectedModel.id, { scale: [scale, scale, scale] })
  }

  // Handle color changes
  const handleColorChange = (color) => {
    if (!selectedModel) return
    onUpdateModel(selectedModel.id, { color })
  }

  // Handle lighting changes
  const handleLightingChange = (property, value) => {
    onUpdateLighting({
      ...lighting,
      [property]: parseFloat(value)
    })
  }

  // Reset model to default position
  const resetModel = () => {
    if (!selectedModel) return
    
    onUpdateModel(selectedModel.id, {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    })
  }

  const tabs = [
    { id: 'models', name: 'Models', icon: SwatchIcon },
    { id: 'lighting', name: 'Lighting', icon: SunIcon },
    { id: 'effects', name: 'Effects', icon: AdjustmentsHorizontalIcon }
  ]

  const colorPresets = [
    '#4F46E5', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#1F2937', '#FFFFFF', '#F3F4F6', '#6B7280'
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-2xl font-bold text-neutral-900">AR Controls</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {/* Models Tab */}
          {activeTab === 'models' && (
            <div className="space-y-6">
              {/* Model Selection */}
              {models.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    Select Model
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {models.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModelId(model.id)}
                        className={`p-3 rounded-lg border-2 transition-colors text-left ${
                          selectedModelId === model.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="font-medium text-neutral-900">{model.name}</div>
                        <div className="text-sm text-neutral-600 capitalize">{model.type}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedModel && (
                <>
                  {/* Position Controls */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-neutral-700">
                        Position
                      </label>
                      <button
                        onClick={resetModel}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                      >
                        <ArrowPathIcon className="h-4 w-4 mr-1" />
                        Reset
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {['x', 'y', 'z'].map((axis, index) => (
                        <div key={axis}>
                          <label className="block text-xs font-medium text-neutral-600 mb-1 uppercase">
                            {axis}
                          </label>
                          <input
                            type="range"
                            min="-2"
                            max="2"
                            step="0.1"
                            value={selectedModel.position[index]}
                            onChange={(e) => handlePositionChange(axis, e.target.value)}
                            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="text-xs text-neutral-500 mt-1 text-center">
                            {selectedModel.position[index].toFixed(1)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rotation Controls */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                      Rotation (degrees)
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {['x', 'y', 'z'].map((axis, index) => (
                        <div key={axis}>
                          <label className="block text-xs font-medium text-neutral-600 mb-1 uppercase">
                            {axis}
                          </label>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            step="5"
                            value={selectedModel.rotation[index] * (180 / Math.PI)} // Convert from radians
                            onChange={(e) => handleRotationChange(axis, e.target.value)}
                            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="text-xs text-neutral-500 mt-1 text-center">
                            {Math.round(selectedModel.rotation[index] * (180 / Math.PI))}°
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scale Control */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                      Scale
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={selectedModel.scale[0]}
                      onChange={(e) => handleScaleChange(e.target.value)}
                      className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="text-xs text-neutral-500 mt-1 text-center">
                      {selectedModel.scale[0].toFixed(1)}x
                    </div>
                  </div>

                  {/* Color Controls */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                      Color
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {colorPresets.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorChange(color)}
                          className={`w-10 h-10 rounded-lg border-2 transition-all ${
                            selectedModel.color === color
                              ? 'border-neutral-900 scale-110'
                              : 'border-neutral-300 hover:border-neutral-400'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    
                    {/* Custom Color Picker */}
                    <div className="mt-3">
                      <input
                        type="color"
                        value={selectedModel.color}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-full h-10 rounded-lg border border-neutral-300 cursor-pointer"
                      />
                    </div>
                  </div>
                </>
              )}

              {models.length === 0 && (
                <div className="text-center py-8 text-neutral-500">
                  <SwatchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No models loaded</p>
                  <p className="text-sm">Select a product to add 3D models</p>
                </div>
              )}
            </div>
          )}

          {/* Lighting Tab */}
          {activeTab === 'lighting' && (
            <div className="space-y-6">
              {/* Ambient Light */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Ambient Light
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={lighting.ambient || 0.4}
                  onChange={(e) => handleLightingChange('ambient', e.target.value)}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-neutral-500 mt-1 text-center">
                  {((lighting.ambient || 0.4) * 100).toFixed(0)}%
                </div>
              </div>

              {/* Directional Light */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Directional Light
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={lighting.directional || 0.8}
                  onChange={(e) => handleLightingChange('directional', e.target.value)}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-neutral-500 mt-1 text-center">
                  {((lighting.directional || 0.8) * 100).toFixed(0)}%
                </div>
              </div>

              {/* Point Light */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Point Light
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={lighting.point || 0.3}
                  onChange={(e) => handleLightingChange('point', e.target.value)}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-neutral-500 mt-1 text-center">
                  {((lighting.point || 0.3) * 100).toFixed(0)}%
                </div>
              </div>

              {/* Lighting Presets */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Lighting Presets
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Natural', ambient: 0.4, directional: 0.8, point: 0.3 },
                    { name: 'Studio', ambient: 0.6, directional: 1.0, point: 0.5 },
                    { name: 'Dramatic', ambient: 0.2, directional: 1.2, point: 0.1 },
                    { name: 'Soft', ambient: 0.8, directional: 0.4, point: 0.6 }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => onUpdateLighting(preset)}
                      className="p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                    >
                      <div className="font-medium text-neutral-900">{preset.name}</div>
                      <div className="text-xs text-neutral-600">
                        A: {preset.ambient} D: {preset.directional} P: {preset.point}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Effects Tab */}
          {activeTab === 'effects' && (
            <div className="space-y-6">
              <div className="text-center py-8 text-neutral-500">
                <AdjustmentsHorizontalIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Advanced Effects</p>
                <p className="text-sm">Coming soon - shadows, reflections, and more</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-neutral-200 bg-neutral-50">
          <div className="text-sm text-neutral-600">
            {models.length} model{models.length !== 1 ? 's' : ''} loaded
          </div>
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
