/**
 * 🧬 Spiritual Light Engine - Core Type Definitions
 *
 * מערכת הטיפוסים המרכזית של מנוע האור הרוחני
 */

// ═══════════════════════════════════════════════════════════════════
// 🌳 SEFIROT - The Ten Divine Emanations
// ═══════════════════════════════════════════════════════════════════

export type Sefirah =
  | 'כתר'      // Keter - Crown - White/Transparent
  | 'חכמה'     // Chokhmah - Wisdom - Silver/Blue
  | 'בינה'     // Binah - Understanding - Black/Dark Blue
  | 'חסד'      // Chesed - Loving-kindness - White/Light Blue
  | 'גבורה'    // Gevurah - Strength - Red/Gold
  | 'תפארת'    // Tiferet - Beauty - Yellow/Gold/Purple
  | 'נצח'      // Netzach - Eternity - Light Pink
  | 'הוד'      // Hod - Splendor - Dark Pink
  | 'יסוד'     // Yesod - Foundation - Orange
  | 'מלכות'    // Malkhut - Sovereignty - Blue/No Light

export interface SefirahVisuals {
  sefirah: Sefirah
  primaryColor: string       // Main glow color
  secondaryColor: string     // Accent/particle color
  emissiveIntensity: number  // Light emission strength
  particleCount: number      // Number of particles
  particleSpeed: number      // Movement speed
  bloomIntensity: number     // Post-process bloom
  pulseFrequency: number     // Rhythmic pulse rate
  trailLength: number        // Particle trail decay
  flowDirection: 'up' | 'down' | 'converge' | 'diverge' | 'spiral'
}

// ═══════════════════════════════════════════════════════════════════
// 📜 SPIRITUAL TEXT STRUCTURES
// ═══════════════════════════════════════════════════════════════════

export type WordType =
  | 'שם'        // Divine Name
  | 'כוונה'     // Intention word
  | 'פסוק'      // Scripture verse
  | 'תפילה'     // Prayer
  | 'רגיל'      // Regular word

export type DivineName =
  | 'הוי-ה'     // YHVH (Tetragrammaton)
  | 'אדנ-י'     // Adonai
  | 'אלהים'    // Elohim
  | 'שדי'      // Shaddai
  | 'צבאות'    // Tzvaot
  | 'אהיה'     // Ehyeh

export interface SpiritualWord {
  id: string
  text: string
  type: WordType
  divineName?: DivineName
  sefirah?: Sefirah
  gematria?: number
  kavvanah?: string          // Intention meaning
  energyLevel: number        // 0-1 spiritual intensity
  duration: number           // Effect duration in ms
}

export interface SpiritualVerse {
  id: string
  words: SpiritualWord[]
  source?: string            // מקור - Tehillim, etc.
  theme?: Sefirah
}

export interface SpiritualText {
  id: string
  title: string
  verses: SpiritualVerse[]
  defaultSefirah?: Sefirah
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 ATTRACTOR SYSTEM
// ═══════════════════════════════════════════════════════════════════

export interface AttractorNode {
  id: string
  wordId: string
  position: {
    x: number  // WebGL normalized -1 to 1
    y: number
    z: number
  }
  domPosition: {
    x: number  // Screen pixels
    y: number
    width: number
    height: number
  }
  sefirah: Sefirah
  energyLevel: number
  active: boolean
  timeActivated?: number
  phase: 'dormant' | 'awakening' | 'active' | 'fading'
}

export interface ParticleConfig {
  count: number
  size: number
  color: string
  speed: number
  turbulence: number
  lifetime: number
  emissionRate: number
  gravity: number
  attractorStrength: number
  trailFade: number
}

// ═══════════════════════════════════════════════════════════════════
// 🌊 SCROLL PREDICTION ENGINE
// ═══════════════════════════════════════════════════════════════════

export interface ScrollState {
  position: number
  velocity: number
  acceleration: number
  direction: 'up' | 'down' | 'static'
  predictedPosition: number   // Where scroll will be in X ms
  timeToWord: Map<string, number>  // Time until word reaches viewport
}

export interface ViewportRegion {
  top: number
  bottom: number
  center: number
  height: number
}

export interface WordVisibility {
  wordId: string
  isVisible: boolean
  distanceToCenter: number
  percentVisible: number
  predictedEntry: number      // ms until entering viewport
  predictedCenter: number     // ms until reaching center
  predictedExit: number       // ms until leaving viewport
}

// ═══════════════════════════════════════════════════════════════════
// ✨ EFFECT SYSTEM
// ═══════════════════════════════════════════════════════════════════

export type EffectType =
  | 'glow'           // Basic glow around word
  | 'particles'      // Particle attraction
  | 'wave'           // Ripple wave effect
  | 'volumetric'     // Volumetric light rays
  | 'aurora'         // Aurora-like flow
  | 'sacred_geometry' // Sacred geometry patterns
  | 'flame'          // Holy fire effect
  | 'water'          // Living water flow
  | 'breath'         // Breathing/pulsing light

export interface EffectConfig {
  type: EffectType
  intensity: number
  duration: number
  delay: number
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce'
  loop: boolean
  blendMode: 'add' | 'multiply' | 'screen' | 'overlay'
}

export interface ActiveEffect {
  id: string
  wordId: string
  config: EffectConfig
  startTime: number
  progress: number
  sefirah: Sefirah
}

// ═══════════════════════════════════════════════════════════════════
// 🎬 POST-PROCESSING
// ═══════════════════════════════════════════════════════════════════

export interface PostProcessConfig {
  bloom: {
    enabled: boolean
    intensity: number
    luminanceThreshold: number
    luminanceSmoothing: number
    radius: number
  }
  depthOfField: {
    enabled: boolean
    focusDistance: number
    focalLength: number
    bokehScale: number
  }
  chromaticAberration: {
    enabled: boolean
    offset: number
  }
  vignette: {
    enabled: boolean
    darkness: number
    offset: number
  }
  noise: {
    enabled: boolean
    opacity: number
  }
  godRays: {
    enabled: boolean
    density: number
    weight: number
    decay: number
    exposure: number
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🎮 ENGINE STATE
// ═══════════════════════════════════════════════════════════════════

export interface EngineState {
  isInitialized: boolean
  isRunning: boolean
  currentSefirah: Sefirah | null
  activeAttractors: AttractorNode[]
  activeEffects: ActiveEffect[]
  scrollState: ScrollState
  postProcess: PostProcessConfig
  performance: {
    fps: number
    drawCalls: number
    particles: number
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🔧 ENGINE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

export interface EngineConfig {
  canvas: {
    width: number
    height: number
    pixelRatio: number
    antialias: boolean
    alpha: boolean
  }
  particles: ParticleConfig
  postProcess: PostProcessConfig
  scroll: {
    predictionTime: number    // How far ahead to predict (ms)
    smoothing: number         // Velocity smoothing factor
    activationThreshold: number // Distance to center for activation
  }
  timing: {
    preActivation: number     // Time before word reaches center
    activeDuration: number    // How long effect stays active
    fadeOutDuration: number   // Fade out time
  }
  debug: boolean
}
