/**
 * 🌌 GPU Particle Attractor System
 *
 * מערכת חלקיקים מואצת GPU שנמשכת למילים קדושות
 */

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Sefirah } from '@/engine/types'
import { SEFIROT_VISUALS } from '@/engine/sefirot'

// ═══════════════════════════════════════════════════════════════════
// SHADER CODE
// ═══════════════════════════════════════════════════════════════════

const vertexShader = /* glsl */ `
  uniform float u_time;
  uniform float u_deltaTime;
  uniform vec3 u_attractorPosition;
  uniform float u_attractorStrength;
  uniform float u_attractorActive;
  uniform float u_flowDirection;
  uniform float u_turbulence;
  uniform float u_particleSpeed;

  attribute float a_size;
  attribute float a_seed;
  attribute float a_life;

  varying float v_life;
  varying float v_distanceToAttractor;

  // Simplex noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  vec3 curl(vec3 p) {
    const float e = 0.1;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);
    float x = snoise(p + dy) - snoise(p - dy);
    float y = snoise(p + dz) - snoise(p - dz);
    float z = snoise(p + dx) - snoise(p - dx);
    return normalize(vec3(x, y, z) / (2.0 * e));
  }

  void main() {
    vec3 pos = position;
    float seed = a_seed;
    float time = u_time * u_particleSpeed;

    // Curl noise for organic movement
    vec3 noisePos = pos * 0.5 + time * 0.2;
    vec3 curlVel = curl(noisePos + seed * 100.0) * u_turbulence;

    // Flow direction
    vec3 flowVel = vec3(0.0);
    if (u_flowDirection < 0.5) {
      flowVel = vec3(0.0, -0.3, 0.0);
    } else if (u_flowDirection < 1.5) {
      flowVel = vec3(0.0, 0.3, 0.0);
    } else if (u_flowDirection < 2.5) {
      flowVel = normalize(u_attractorPosition - pos) * 0.2;
    } else if (u_flowDirection < 3.5) {
      flowVel = normalize(pos - u_attractorPosition) * 0.2;
    } else {
      vec3 toCenter = u_attractorPosition - pos;
      vec3 tangent = normalize(cross(toCenter, vec3(0.0, 0.0, 1.0)));
      flowVel = tangent * 0.3 + normalize(toCenter) * 0.15;
    }

    // Attractor pull
    vec3 toAttractor = u_attractorPosition - pos;
    float distToAttractor = length(toAttractor);
    vec3 attractorDir = normalize(toAttractor);
    float pullStrength = u_attractorStrength * u_attractorActive;
    pullStrength *= 1.0 / (distToAttractor * distToAttractor + 0.1);
    pullStrength = min(pullStrength, 1.5);
    vec3 attractorVel = attractorDir * pullStrength;

    // Combine velocities
    vec3 finalVel = curlVel + flowVel + attractorVel;
    pos += finalVel * u_deltaTime * 0.5;

    v_distanceToAttractor = distToAttractor;
    v_life = a_life;

    // Size varies with distance
    float sizeFactor = 1.0 + (1.0 - min(distToAttractor, 2.0) / 2.0) * u_attractorActive * 0.5;
    float finalSize = a_size * sizeFactor;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = finalSize * (300.0 / -mvPosition.z);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 u_color;
  uniform vec3 u_secondaryColor;
  uniform float u_time;
  uniform float u_attractorActive;
  uniform float u_pulseFrequency;

  varying float v_life;
  varying float v_distanceToAttractor;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha = pow(alpha, 1.5);

    float pulse = 0.8 + 0.2 * sin(u_time * u_pulseFrequency * 6.28318);

    float colorMix = smoothstep(0.0, 2.0, v_distanceToAttractor);
    vec3 color = mix(u_color, u_secondaryColor, colorMix);

    float brightness = 1.0 + (1.0 - min(v_distanceToAttractor, 1.0)) * u_attractorActive * 0.5;
    color *= brightness * pulse;

    float innerGlow = 1.0 - smoothstep(0.0, 0.3, dist);
    color += vec3(1.0) * innerGlow * 0.3 * u_attractorActive;

    alpha *= v_life;

    gl_FragColor = vec4(color, alpha);
  }
`

// ═══════════════════════════════════════════════════════════════════
// COMPONENT PROPS
// ═══════════════════════════════════════════════════════════════════

interface ParticleAttractorProps {
  count?: number
  sefirah: Sefirah
  attractorPosition: THREE.Vector3
  attractorActive: number // 0-1 activation level
  baseSize?: number
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function ParticleAttractor({
  count = 1500,
  sefirah,
  attractorPosition,
  attractorActive,
  baseSize = 4
}: ParticleAttractorProps) {
  const meshRef = useRef<THREE.Points>(null)
  const { viewport } = useThree()

  const visuals = SEFIROT_VISUALS[sefirah]

  // Flow direction mapping
  const flowDirectionMap: Record<string, number> = {
    down: 0,
    up: 1,
    converge: 2,
    diverge: 3,
    spiral: 4
  }

  // Create particle attributes
  const { positions, sizes, seeds, lifes } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const seeds = new Float32Array(count)
    const lifes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Distribute particles in a sphere around attractor
      const theta = Math.random() * Math.PI * 2
      const phi = (Math.random() - 0.5) * Math.PI
      const r = 1.5 + Math.random() * 3

      positions[i * 3] = attractorPosition.x + r * Math.cos(theta) * Math.cos(phi)
      positions[i * 3 + 1] = attractorPosition.y + r * Math.sin(phi)
      positions[i * 3 + 2] = attractorPosition.z + r * Math.sin(theta) * Math.cos(phi)

      sizes[i] = baseSize * (0.5 + Math.random() * 1.0)
      seeds[i] = Math.random()
      lifes[i] = 0.5 + Math.random() * 0.5
    }

    return { positions, sizes, seeds, lifes }
  }, [count, attractorPosition, baseSize])

  // Create shader material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_time: { value: 0 },
        u_deltaTime: { value: 0.016 },
        u_attractorPosition: { value: attractorPosition.clone() },
        u_attractorStrength: { value: visuals.emissiveIntensity },
        u_attractorActive: { value: attractorActive },
        u_flowDirection: { value: flowDirectionMap[visuals.flowDirection] },
        u_turbulence: { value: 0.3 },
        u_particleSpeed: { value: visuals.particleSpeed },
        u_color: { value: new THREE.Color(visuals.primaryColor) },
        u_secondaryColor: { value: new THREE.Color(visuals.secondaryColor) },
        u_pulseFrequency: { value: visuals.pulseFrequency }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  }, [sefirah, attractorPosition, attractorActive, visuals])

  // Update uniforms on each frame
  useFrame((state, delta) => {
    if (material.uniforms) {
      material.uniforms.u_time.value = state.clock.elapsedTime
      material.uniforms.u_deltaTime.value = delta
      material.uniforms.u_attractorActive.value = attractorActive
      material.uniforms.u_attractorPosition.value.copy(attractorPosition)
    }
  })

  // Update colors when sefirah changes
  useEffect(() => {
    if (material.uniforms) {
      material.uniforms.u_color.value.set(visuals.primaryColor)
      material.uniforms.u_secondaryColor.value.set(visuals.secondaryColor)
      material.uniforms.u_attractorStrength.value = visuals.emissiveIntensity
      material.uniforms.u_flowDirection.value = flowDirectionMap[visuals.flowDirection]
      material.uniforms.u_particleSpeed.value = visuals.particleSpeed
      material.uniforms.u_pulseFrequency.value = visuals.pulseFrequency
    }
  }, [sefirah, visuals, material])

  return (
    <points ref={meshRef} material={material}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-a_size"
          count={count}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-a_seed"
          count={count}
          array={seeds}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-a_life"
          count={count}
          array={lifes}
          itemSize={1}
        />
      </bufferGeometry>
    </points>
  )
}

export default ParticleAttractor
