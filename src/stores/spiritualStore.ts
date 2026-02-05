/**
 * 🧬 Spiritual Engine State Store
 *
 * Zustand store for managing the spiritual rendering engine state
 */

import { create } from 'zustand'
import type {
  Sefirah,
  AttractorNode,
  ActiveEffect,
  ScrollState,
  PostProcessConfig,
  EngineConfig
} from '@/engine/types'

// ═══════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════

const defaultPostProcess: PostProcessConfig = {
  bloom: {
    enabled: true,
    intensity: 1.5,
    luminanceThreshold: 0.2,
    luminanceSmoothing: 0.9,
    radius: 0.8
  },
  depthOfField: {
    enabled: false,
    focusDistance: 0.02,
    focalLength: 0.02,
    bokehScale: 2
  },
  chromaticAberration: {
    enabled: true,
    offset: 0.002
  },
  vignette: {
    enabled: true,
    darkness: 0.5,
    offset: 0.3
  },
  noise: {
    enabled: true,
    opacity: 0.03
  },
  godRays: {
    enabled: true,
    density: 0.96,
    weight: 0.4,
    decay: 0.93,
    exposure: 0.6
  }
}

const defaultConfig: EngineConfig = {
  canvas: {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    antialias: true,
    alpha: true
  },
  particles: {
    count: 2000,
    size: 3,
    color: '#4488ff',
    speed: 0.5,
    turbulence: 0.3,
    lifetime: 5,
    emissionRate: 50,
    gravity: 0,
    attractorStrength: 1.5,
    trailFade: 0.95
  },
  postProcess: defaultPostProcess,
  scroll: {
    predictionTime: 500,
    smoothing: 0.1,
    activationThreshold: 0.3
  },
  timing: {
    preActivation: 300,
    activeDuration: 2000,
    fadeOutDuration: 800
  },
  debug: false
}

// ═══════════════════════════════════════════════════════════════════
// STORE INTERFACE
// ═══════════════════════════════════════════════════════════════════

interface SpiritualStore {
  // State
  isInitialized: boolean
  isRunning: boolean
  currentSefirah: Sefirah | null
  activeAttractors: AttractorNode[]
  activeEffects: ActiveEffect[]
  scrollState: ScrollState
  config: EngineConfig
  performance: {
    fps: number
    drawCalls: number
    particles: number
  }

  // Word DOM references
  wordElements: Map<string, HTMLElement>

  // Actions
  initialize: () => void
  start: () => void
  stop: () => void

  // Sefirah management
  setCurrentSefirah: (sefirah: Sefirah | null) => void

  // Attractor management
  addAttractor: (attractor: AttractorNode) => void
  removeAttractor: (id: string) => void
  updateAttractor: (id: string, updates: Partial<AttractorNode>) => void
  activateAttractor: (id: string) => void
  deactivateAttractor: (id: string) => void

  // Effect management
  addEffect: (effect: ActiveEffect) => void
  removeEffect: (id: string) => void
  updateEffectProgress: (id: string, progress: number) => void

  // Scroll management
  updateScrollState: (updates: Partial<ScrollState>) => void

  // Word element management
  registerWordElement: (wordId: string, element: HTMLElement) => void
  unregisterWordElement: (wordId: string) => void
  getWordElement: (wordId: string) => HTMLElement | undefined

  // Configuration
  updateConfig: (updates: Partial<EngineConfig>) => void
  updatePostProcess: (updates: Partial<PostProcessConfig>) => void

  // Performance
  updatePerformance: (updates: Partial<{ fps: number; drawCalls: number; particles: number }>) => void
}

// ═══════════════════════════════════════════════════════════════════
// STORE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════

export const useSpiritualStore = create<SpiritualStore>((set, get) => ({
  // Initial state
  isInitialized: false,
  isRunning: false,
  currentSefirah: null,
  activeAttractors: [],
  activeEffects: [],
  scrollState: {
    position: 0,
    velocity: 0,
    acceleration: 0,
    direction: 'static',
    predictedPosition: 0,
    timeToWord: new Map()
  },
  config: defaultConfig,
  performance: {
    fps: 60,
    drawCalls: 0,
    particles: 0
  },
  wordElements: new Map(),

  // Lifecycle actions
  initialize: () => set({ isInitialized: true }),
  start: () => set({ isRunning: true }),
  stop: () => set({ isRunning: false }),

  // Sefirah management
  setCurrentSefirah: (sefirah) => set({ currentSefirah: sefirah }),

  // Attractor management
  addAttractor: (attractor) =>
    set((state) => ({
      activeAttractors: [...state.activeAttractors, attractor]
    })),

  removeAttractor: (id) =>
    set((state) => ({
      activeAttractors: state.activeAttractors.filter((a) => a.id !== id)
    })),

  updateAttractor: (id, updates) =>
    set((state) => ({
      activeAttractors: state.activeAttractors.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      )
    })),

  activateAttractor: (id) =>
    set((state) => ({
      activeAttractors: state.activeAttractors.map((a) =>
        a.id === id
          ? { ...a, active: true, phase: 'awakening' as const, timeActivated: Date.now() }
          : a
      )
    })),

  deactivateAttractor: (id) =>
    set((state) => ({
      activeAttractors: state.activeAttractors.map((a) =>
        a.id === id ? { ...a, phase: 'fading' as const } : a
      )
    })),

  // Effect management
  addEffect: (effect) =>
    set((state) => ({
      activeEffects: [...state.activeEffects, effect]
    })),

  removeEffect: (id) =>
    set((state) => ({
      activeEffects: state.activeEffects.filter((e) => e.id !== id)
    })),

  updateEffectProgress: (id, progress) =>
    set((state) => ({
      activeEffects: state.activeEffects.map((e) =>
        e.id === id ? { ...e, progress } : e
      )
    })),

  // Scroll management
  updateScrollState: (updates) =>
    set((state) => ({
      scrollState: { ...state.scrollState, ...updates }
    })),

  // Word element management
  registerWordElement: (wordId, element) => {
    const elements = get().wordElements
    elements.set(wordId, element)
    set({ wordElements: new Map(elements) })
  },

  unregisterWordElement: (wordId) => {
    const elements = get().wordElements
    elements.delete(wordId)
    set({ wordElements: new Map(elements) })
  },

  getWordElement: (wordId) => get().wordElements.get(wordId),

  // Configuration
  updateConfig: (updates) =>
    set((state) => ({
      config: { ...state.config, ...updates }
    })),

  updatePostProcess: (updates) =>
    set((state) => ({
      config: {
        ...state.config,
        postProcess: { ...state.config.postProcess, ...updates }
      }
    })),

  // Performance
  updatePerformance: (updates) =>
    set((state) => ({
      performance: { ...state.performance, ...updates }
    }))
}))

// ═══════════════════════════════════════════════════════════════════
// SELECTOR HOOKS
// ═══════════════════════════════════════════════════════════════════

export const useCurrentSefirah = () =>
  useSpiritualStore((state) => state.currentSefirah)

export const useActiveAttractors = () =>
  useSpiritualStore((state) => state.activeAttractors)

export const useActiveEffects = () =>
  useSpiritualStore((state) => state.activeEffects)

export const useEngineConfig = () =>
  useSpiritualStore((state) => state.config)

export const usePostProcessConfig = () =>
  useSpiritualStore((state) => state.config.postProcess)

export const useScrollState = () =>
  useSpiritualStore((state) => state.scrollState)

export const useIsRunning = () =>
  useSpiritualStore((state) => state.isRunning)
