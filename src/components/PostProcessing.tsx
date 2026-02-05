/**
 * ✨ Post Processing Pipeline
 *
 * Bloom, Depth of Field, Vignette, and Noise
 */

import {
  EffectComposer,
  Bloom,
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
      <Bloom
        intensity={config.bloom.enabled ? config.bloom.intensity : 0}
        luminanceThreshold={config.bloom.luminanceThreshold}
        luminanceSmoothing={config.bloom.luminanceSmoothing}
        kernelSize={KernelSize.LARGE}
        mipmapBlur
      />

      <DepthOfField
        focusDistance={config.depthOfField.focusDistance}
        focalLength={config.depthOfField.focalLength}
        bokehScale={config.depthOfField.enabled ? config.depthOfField.bokehScale : 0}
      />

      <Vignette
        darkness={config.vignette.enabled ? config.vignette.darkness : 0}
        offset={config.vignette.offset}
      />

      <Noise
        opacity={config.noise.enabled ? config.noise.opacity : 0}
        blendFunction={BlendFunction.OVERLAY}
      />
    </EffectComposer>
  )
}

export default PostProcessing
