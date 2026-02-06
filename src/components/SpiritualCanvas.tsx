/**
 * 🧬 Spiritual Canvas - Main WebGL Rendering Component
 *
 * הקנבס הרוחני - מנוע הרנדור המרכזי
 */

import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import * as THREE from 'three'
import { ParticleAttractor } from './ParticleAttractor'
import { PostProcessing } from './PostProcessing'
import { AuroraBackground } from './AuroraBackground'
import { useSpiritualStore, useActiveAttractors, useCurrentSefirah } from '@/stores/spiritualStore'
import type { Sefirah } from '@/engine/types'

// ═══════════════════════════════════════════════════════════════════
// ATTRACTOR RENDERER
// ═══════════════════════════════════════════════════════════════════

function AttractorRenderer() {
  const attractors = useActiveAttractors()
  const currentSefirah = useCurrentSefirah()

  return (
    <>
      {attractors.map((attractor) => (
        <ParticleAttractor
          key={attractor.id}
          sefirah={attractor.sefirah}
          attractorPosition={
            new THREE.Vector3(
              attractor.position.x,
              attractor.position.y,
              attractor.position.z
            )
          }
          attractorActive={attractor.active ? 1 : 0}
          count={attractor.active ? 400 : 100}
        />
      ))}

      {/* Default particles when no active attractors */}
      {attractors.length === 0 && currentSefirah && (
        <ParticleAttractor
          sefirah={currentSefirah}
          attractorPosition={new THREE.Vector3(0, 0, 0)}
          attractorActive={0.2}
          count={150}
        />
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CAMERA CONTROLLER
// ═══════════════════════════════════════════════════════════════════

function CameraController() {
  const { camera } = useThree()

  useFrame((state) => {
    // Subtle camera movement for organic feel
    const time = state.clock.elapsedTime
    camera.position.x = Math.sin(time * 0.1) * 0.2
    camera.position.y = Math.cos(time * 0.15) * 0.1
  })

  return null
}

// ═══════════════════════════════════════════════════════════════════
// SCENE CONTENT
// ═══════════════════════════════════════════════════════════════════

interface SceneContentProps {
  sefirah: Sefirah
  showBackground?: boolean
}

function SceneContent({ sefirah, showBackground = true }: SceneContentProps) {
  return (
    <>
      <CameraController />

      {/* Ambient lighting */}
      <ambientLight intensity={0.1} />

      {/* Aurora background - very subtle */}
      {showBackground && <AuroraBackground sefirah={sefirah} intensity={0.12} />}

      {/* Particle attractors */}
      <AttractorRenderer />

      {/* Post processing */}
      <PostProcessing />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN CANVAS COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface SpiritualCanvasProps {
  sefirah?: Sefirah
  showBackground?: boolean
  className?: string
  style?: React.CSSProperties
}

export function SpiritualCanvas({
  sefirah = 'מלכות',
  showBackground = true,
  className,
  style
}: SpiritualCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { initialize, setCurrentSefirah } = useSpiritualStore()

  useEffect(() => {
    initialize()
    setCurrentSefirah(sefirah)
  }, [initialize, setCurrentSefirah, sefirah])

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        ...style
      }}
    >
      <Canvas
        ref={canvasRef}
        camera={{
          fov: 75,
          near: 0.1,
          far: 100,
          position: [0, 0, 5]
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <Suspense fallback={null}>
          <SceneContent sefirah={sefirah} showBackground={showBackground} />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default SpiritualCanvas
