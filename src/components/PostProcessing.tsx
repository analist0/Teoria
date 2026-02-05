/**
 * ✨ Post Processing Pipeline
 *
 * Bloom, Depth of Field, Chromatic Aberration, Vignette, and Noise
 */

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  Noise,
  DepthOfField
} from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'
import type { PostProcessConfig } from '@/engine/types'
import { usePostProcessConfig } from '@/stores/spiritualStore'

interface PostProcessingProps {
  config?: Partial<PostProcessConfig>
}

export function PostProcessing({ config: propConfig }: PostProcessingProps) {
  const storeConfig = usePostProcessConfig()
  const config = { ...storeConfig, ...propConfig }

  return (
    <EffectComposer multisampling={0}>
      {config.bloom.enabled && (
        <Bloom
          intensity={config.bloom.intensity}
          luminanceThreshold={config.bloom.luminanceThreshold}
          luminanceSmoothing={config.bloom.luminanceSmoothing}
          kernelSize={KernelSize.LARGE}
          mipmapBlur
        />
      )}

      {config.depthOfField.enabled && (
        <DepthOfField
          focusDistance={config.depthOfField.focusDistance}
          focalLength={config.depthOfField.focalLength}
          bokehScale={config.depthOfField.bokehScale}
        />
      )}

      {config.chromaticAberration.enabled && (
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[config.chromaticAberration.offset, config.chromaticAberration.offset]}
        />
      )}

      {config.vignette.enabled && (
        <Vignette
          darkness={config.vignette.darkness}
          offset={config.vignette.offset}
        />
      )}

      {config.noise.enabled && (
        <Noise
          opacity={config.noise.opacity}
          blendFunction={BlendFunction.OVERLAY}
        />
      )}
    </EffectComposer>
  )
}

export default PostProcessing
