/**
 * 🌳 Sefirot Visual Themes
 *
 * הגדרות ויזואליות לעשר הספירות
 * Each sefirah has its unique light signature
 */

import type { Sefirah, SefirahVisuals } from './types'

export const SEFIROT_VISUALS: Record<Sefirah, SefirahVisuals> = {
  'כתר': {
    sefirah: 'כתר',
    primaryColor: '#ffffff',
    secondaryColor: '#f0f0ff',
    emissiveIntensity: 2.0,
    particleCount: 500,
    particleSpeed: 0.3,
    bloomIntensity: 2.5,
    pulseFrequency: 0.5,
    trailLength: 0.9,
    flowDirection: 'diverge'
  },

  'חכמה': {
    sefirah: 'חכמה',
    primaryColor: '#4488ff',
    secondaryColor: '#88aaff',
    emissiveIntensity: 1.8,
    particleCount: 400,
    particleSpeed: 0.5,
    bloomIntensity: 2.0,
    pulseFrequency: 0.7,
    trailLength: 0.85,
    flowDirection: 'spiral'
  },

  'בינה': {
    sefirah: 'בינה',
    primaryColor: '#1a1a3a',
    secondaryColor: '#3344aa',
    emissiveIntensity: 1.2,
    particleCount: 350,
    particleSpeed: 0.25,
    bloomIntensity: 1.5,
    pulseFrequency: 0.4,
    trailLength: 0.95,
    flowDirection: 'converge'
  },

  'חסד': {
    sefirah: 'חסד',
    primaryColor: '#66ccff',
    secondaryColor: '#ffffff',
    emissiveIntensity: 1.9,
    particleCount: 450,
    particleSpeed: 0.45,
    bloomIntensity: 2.2,
    pulseFrequency: 0.8,
    trailLength: 0.8,
    flowDirection: 'down'
  },

  'גבורה': {
    sefirah: 'גבורה',
    primaryColor: '#ff4444',
    secondaryColor: '#ffaa44',
    emissiveIntensity: 2.2,
    particleCount: 380,
    particleSpeed: 0.7,
    bloomIntensity: 2.0,
    pulseFrequency: 1.2,
    trailLength: 0.7,
    flowDirection: 'up'
  },

  'תפארת': {
    sefirah: 'תפארת',
    primaryColor: '#ffcc00',
    secondaryColor: '#9944ff',
    emissiveIntensity: 2.0,
    particleCount: 500,
    particleSpeed: 0.4,
    bloomIntensity: 2.3,
    pulseFrequency: 0.6,
    trailLength: 0.85,
    flowDirection: 'spiral'
  },

  'נצח': {
    sefirah: 'נצח',
    primaryColor: '#ff88aa',
    secondaryColor: '#ffccdd',
    emissiveIntensity: 1.6,
    particleCount: 320,
    particleSpeed: 0.55,
    bloomIntensity: 1.8,
    pulseFrequency: 0.9,
    trailLength: 0.75,
    flowDirection: 'up'
  },

  'הוד': {
    sefirah: 'הוד',
    primaryColor: '#aa4488',
    secondaryColor: '#ff66aa',
    emissiveIntensity: 1.5,
    particleCount: 300,
    particleSpeed: 0.5,
    bloomIntensity: 1.7,
    pulseFrequency: 0.85,
    trailLength: 0.78,
    flowDirection: 'down'
  },

  'יסוד': {
    sefirah: 'יסוד',
    primaryColor: '#ff8844',
    secondaryColor: '#ffcc88',
    emissiveIntensity: 1.7,
    particleCount: 400,
    particleSpeed: 0.35,
    bloomIntensity: 1.9,
    pulseFrequency: 0.65,
    trailLength: 0.88,
    flowDirection: 'converge'
  },

  'מלכות': {
    sefirah: 'מלכות',
    primaryColor: '#2244aa',
    secondaryColor: '#4466dd',
    emissiveIntensity: 1.4,
    particleCount: 350,
    particleSpeed: 0.3,
    bloomIntensity: 1.6,
    pulseFrequency: 0.5,
    trailLength: 0.92,
    flowDirection: 'down'
  }
}

/**
 * Get color as THREE.js compatible hex number
 */
export function getSefirahColorHex(sefirah: Sefirah): number {
  const color = SEFIROT_VISUALS[sefirah].primaryColor
  return parseInt(color.replace('#', ''), 16)
}

/**
 * Get visuals for a sefirah with optional intensity multiplier
 */
export function getSefirahVisuals(
  sefirah: Sefirah,
  intensityMultiplier = 1.0
): SefirahVisuals {
  const base = SEFIROT_VISUALS[sefirah]
  return {
    ...base,
    emissiveIntensity: base.emissiveIntensity * intensityMultiplier,
    bloomIntensity: base.bloomIntensity * intensityMultiplier,
    particleCount: Math.floor(base.particleCount * intensityMultiplier)
  }
}

/**
 * Blend between two sefirot visuals for transitions
 */
export function blendSefirot(
  from: Sefirah,
  to: Sefirah,
  t: number // 0-1 transition progress
): SefirahVisuals {
  const a = SEFIROT_VISUALS[from]
  const b = SEFIROT_VISUALS[to]

  const lerp = (x: number, y: number) => x + (y - x) * t

  return {
    sefirah: t < 0.5 ? from : to,
    primaryColor: t < 0.5 ? a.primaryColor : b.primaryColor,
    secondaryColor: t < 0.5 ? a.secondaryColor : b.secondaryColor,
    emissiveIntensity: lerp(a.emissiveIntensity, b.emissiveIntensity),
    particleCount: Math.floor(lerp(a.particleCount, b.particleCount)),
    particleSpeed: lerp(a.particleSpeed, b.particleSpeed),
    bloomIntensity: lerp(a.bloomIntensity, b.bloomIntensity),
    pulseFrequency: lerp(a.pulseFrequency, b.pulseFrequency),
    trailLength: lerp(a.trailLength, b.trailLength),
    flowDirection: t < 0.5 ? a.flowDirection : b.flowDirection
  }
}

/**
 * Divine Name to Sefirah mapping
 */
export const DIVINE_NAME_SEFIRAH: Record<string, Sefirah> = {
  'הוי-ה': 'תפארת',
  'אדנ-י': 'מלכות',
  'אלהים': 'בינה',
  'שדי': 'יסוד',
  'צבאות': 'נצח',
  'אהיה': 'כתר'
}
