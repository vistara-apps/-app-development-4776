import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

// AR Scene Component that renders 3D models over camera feed
function ARSceneContent({ models, poseData, lighting, onModelUpdate }) {
  const groupRef = useRef()
  const { camera, gl } = useThree()

  // Update model positions based on pose data
  useFrame(() => {
    if (groupRef.current && poseData) {
      // Apply pose-based transformations
      const { landmarks, visibility } = poseData
      
      if (landmarks && landmarks.length > 0) {
        // Position models based on body landmarks
        // This is a simplified example - real implementation would be more sophisticated
        const shoulderLeft = landmarks[11] // Left shoulder
        const shoulderRight = landmarks[12] // Right shoulder
        
        if (shoulderLeft && shoulderRight && visibility > 0.5) {
          const centerX = (shoulderLeft.x + shoulderRight.x) / 2
          const centerY = (shoulderLeft.y + shoulderRight.y) / 2
          const shoulderWidth = Math.abs(shoulderRight.x - shoulderLeft.x)
          
          // Convert normalized coordinates to 3D space
          groupRef.current.position.x = (centerX - 0.5) * 4
          groupRef.current.position.y = -(centerY - 0.5) * 3
          groupRef.current.scale.setScalar(shoulderWidth * 8) // Scale based on shoulder width
        }
      }
    }
  })

  return (
    <group ref={groupRef}>
      {/* Render 3D clothing models */}
      {models.map((model, index) => (
        <Model3D
          key={model.id || index}
          model={model}
          position={model.position || [0, 0, 0]}
          rotation={model.rotation || [0, 0, 0]}
          scale={model.scale || [1, 1, 1]}
          onUpdate={onModelUpdate}
        />
      ))}
      
      {/* Lighting setup */}
      <ambientLight intensity={lighting?.ambient || 0.4} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={lighting?.directional || 0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight
        position={[-5, 5, 5]}
        intensity={lighting?.point || 0.3}
        color="#ffffff"
      />
      
      {/* Environment for reflections */}
      <Environment preset="studio" />
      
      {/* Ground shadows */}
      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.3}
        scale={10}
        blur={2}
        far={4}
      />
    </group>
  )
}

// Individual 3D Model Component
function Model3D({ model, position, rotation, scale, onUpdate }) {
  const meshRef = useRef()
  const [geometry, setGeometry] = useState(null)
  const [material, setMaterial] = useState(null)

  // Load model geometry and materials
  useEffect(() => {
    if (model.type === 'shirt') {
      // Create a simple shirt geometry (in real app, load from GLTF/GLB files)
      const shirtGeometry = new THREE.BoxGeometry(1.5, 2, 0.3)
      const shirtMaterial = new THREE.MeshStandardMaterial({
        color: model.color || '#4F46E5',
        roughness: 0.7,
        metalness: 0.1,
        transparent: true,
        opacity: 0.9
      })
      
      setGeometry(shirtGeometry)
      setMaterial(shirtMaterial)
    } else if (model.type === 'pants') {
      // Create pants geometry
      const pantsGeometry = new THREE.CylinderGeometry(0.4, 0.5, 2, 8)
      const pantsMaterial = new THREE.MeshStandardMaterial({
        color: model.color || '#1F2937',
        roughness: 0.8,
        metalness: 0.05
      })
      
      setGeometry(pantsGeometry)
      setMaterial(pantsMaterial)
    } else if (model.type === 'dress') {
      // Create dress geometry
      const dressGeometry = new THREE.ConeGeometry(1, 3, 8)
      const dressMaterial = new THREE.MeshStandardMaterial({
        color: model.color || '#EC4899',
        roughness: 0.6,
        metalness: 0.1
      })
      
      setGeometry(dressGeometry)
      setMaterial(dressMaterial)
    }
  }, [model])

  // Animation frame
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle animation for realism
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02
      
      // Notify parent of updates
      onUpdate?.(model.id, {
        position: meshRef.current.position.toArray(),
        rotation: meshRef.current.rotation.toArray(),
        scale: meshRef.current.scale.toArray()
      })
    }
  })

  if (!geometry || !material) return null

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    />
  )
}

// Main AR Scene Component
export default function ARScene({
  videoElement,
  models = [],
  poseData = null,
  lighting = {},
  controls = {},
  onModelUpdate,
  className = ""
}) {
  const containerRef = useRef()
  const [isReady, setIsReady] = useState(false)

  // Setup AR scene when video is ready
  useEffect(() => {
    if (videoElement && containerRef.current) {
      setIsReady(true)
    }
  }, [videoElement])

  if (!isReady) {
    return (
      <div className={`flex items-center justify-center bg-neutral-900 ${className}`}>
        <div className="text-white text-center">
          <div className="loading-spinner w-8 h-8 border-2 border-white/30 border-t-white mx-auto mb-4"></div>
          <p>Initializing AR Scene...</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Video Background */}
      {videoElement && (
        <video
          ref={(ref) => {
            if (ref && videoElement.srcObject) {
              ref.srcObject = videoElement.srcObject
              ref.play()
            }
          }}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          style={{ 
            transform: 'scaleX(-1)', // Mirror for front camera
            zIndex: 1
          }}
        />
      )}
      
      {/* 3D AR Overlay */}
      <div className="absolute inset-0" style={{ zIndex: 2 }}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ 
            alpha: true, 
            antialias: true,
            preserveDrawingBuffer: true 
          }}
          style={{ background: 'transparent' }}
        >
          <ARSceneContent
            models={models}
            poseData={poseData}
            lighting={lighting}
            onModelUpdate={onModelUpdate}
          />
          
          {/* Camera controls (optional) */}
          {controls.enableOrbit && (
            <OrbitControls
              enablePan={controls.enablePan !== false}
              enableZoom={controls.enableZoom !== false}
              enableRotate={controls.enableRotate !== false}
              maxDistance={controls.maxDistance || 10}
              minDistance={controls.minDistance || 2}
            />
          )}
        </Canvas>
      </div>
      
      {/* AR Overlay UI */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
        {/* Pose tracking indicators */}
        {poseData && poseData.landmarks && (
          <div className="absolute inset-0">
            {poseData.landmarks.slice(11, 13).map((landmark, index) => (
              <div
                key={index}
                className="absolute w-2 h-2 bg-primary-500 rounded-full transform -translate-x-1 -translate-y-1"
                style={{
                  left: `${landmark.x * 100}%`,
                  top: `${landmark.y * 100}%`,
                  opacity: landmark.visibility || 0.5
                }}
              />
            ))}
          </div>
        )}
        
        {/* Model count indicator */}
        {models.length > 0 && (
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
            {models.length} model{models.length !== 1 ? 's' : ''} loaded
          </div>
        )}
      </div>
    </div>
  )
}
