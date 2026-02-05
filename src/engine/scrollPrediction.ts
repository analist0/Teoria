/**
 * 🌊 Scroll Prediction Engine
 *
 * מנוע חיזוי גלילה - צופה מתי מילה תגיע ל-viewport
 * Predicts when words will enter the viewport and pre-activates effects
 */

import type { ScrollState, WordVisibility, ViewportRegion } from './types'

// ═══════════════════════════════════════════════════════════════════
// SCROLL STATE TRACKER
// ═══════════════════════════════════════════════════════════════════

interface ScrollHistory {
  position: number
  timestamp: number
}

const HISTORY_SIZE = 10
const scrollHistory: ScrollHistory[] = []
let lastScrollTime = 0

/**
 * Calculate scroll velocity using recent history
 */
function calculateVelocity(history: ScrollHistory[]): number {
  if (history.length < 2) return 0

  const recent = history.slice(-5) // Use last 5 samples
  let totalVelocity = 0
  let weightSum = 0

  for (let i = 1; i < recent.length; i++) {
    const dt = recent[i].timestamp - recent[i - 1].timestamp
    if (dt > 0) {
      const velocity = (recent[i].position - recent[i - 1].position) / dt
      const weight = i // More recent samples weighted higher
      totalVelocity += velocity * weight
      weightSum += weight
    }
  }

  return weightSum > 0 ? totalVelocity / weightSum : 0
}

/**
 * Calculate scroll acceleration
 */
function calculateAcceleration(history: ScrollHistory[]): number {
  if (history.length < 3) return 0

  const recent = history.slice(-3)
  const v1 =
    (recent[1].position - recent[0].position) /
    (recent[1].timestamp - recent[0].timestamp || 1)
  const v2 =
    (recent[2].position - recent[1].position) /
    (recent[2].timestamp - recent[1].timestamp || 1)

  const dt = recent[2].timestamp - recent[0].timestamp
  return dt > 0 ? (v2 - v1) / dt : 0
}

/**
 * Predict scroll position at a future time
 */
function predictPosition(
  currentPosition: number,
  velocity: number,
  acceleration: number,
  timeAhead: number
): number {
  // Physics: position = p0 + v*t + 0.5*a*t^2
  // But apply damping for scroll deceleration
  const damping = 0.95
  const effectiveVelocity = velocity * Math.pow(damping, timeAhead / 100)
  const effectiveAcceleration = acceleration * Math.pow(damping, timeAhead / 50)

  return (
    currentPosition +
    effectiveVelocity * timeAhead +
    0.5 * effectiveAcceleration * timeAhead * timeAhead
  )
}

/**
 * Update scroll state from scroll event
 */
export function updateScrollState(
  scrollTop: number,
  timestamp: number = Date.now()
): ScrollState {
  // Add to history
  scrollHistory.push({ position: scrollTop, timestamp })
  if (scrollHistory.length > HISTORY_SIZE) {
    scrollHistory.shift()
  }

  const velocity = calculateVelocity(scrollHistory)
  const acceleration = calculateAcceleration(scrollHistory)

  // Determine direction
  let direction: 'up' | 'down' | 'static' = 'static'
  if (Math.abs(velocity) > 0.1) {
    direction = velocity > 0 ? 'down' : 'up'
  }

  // Predict position 500ms ahead
  const predictedPosition = predictPosition(
    scrollTop,
    velocity,
    acceleration,
    500
  )

  lastScrollTime = timestamp

  return {
    position: scrollTop,
    velocity,
    acceleration,
    direction,
    predictedPosition,
    timeToWord: new Map()
  }
}

// ═══════════════════════════════════════════════════════════════════
// WORD VISIBILITY TRACKING
// ═══════════════════════════════════════════════════════════════════

/**
 * Get viewport dimensions
 */
export function getViewport(): ViewportRegion {
  const height = window.innerHeight
  return {
    top: 0,
    bottom: height,
    center: height / 2,
    height
  }
}

/**
 * Calculate word visibility and predicted timings
 */
export function calculateWordVisibility(
  wordRect: DOMRect,
  scrollState: ScrollState,
  viewport: ViewportRegion
): WordVisibility {
  const wordCenter = wordRect.top + wordRect.height / 2
  const distanceToCenter = wordCenter - viewport.center

  // Check current visibility
  const isVisible =
    wordRect.bottom > viewport.top && wordRect.top < viewport.bottom

  // Calculate percent visible
  let percentVisible = 0
  if (isVisible) {
    const visibleTop = Math.max(wordRect.top, viewport.top)
    const visibleBottom = Math.min(wordRect.bottom, viewport.bottom)
    percentVisible = (visibleBottom - visibleTop) / wordRect.height
  }

  // Predict entry/center/exit times based on scroll velocity
  const velocity = scrollState.velocity || 0.001 // Avoid division by zero

  // Distance the word needs to travel (in pixels)
  const distanceToEntry = wordRect.top - viewport.bottom // Negative if already past
  const distanceToExit = wordRect.bottom - viewport.top

  // Time = distance / velocity (velocity is pixels per ms)
  // Positive time = future, negative = past
  const predictedEntry =
    velocity !== 0 ? distanceToEntry / -velocity : Infinity
  const predictedCenter =
    velocity !== 0 ? distanceToCenter / -velocity : Infinity
  const predictedExit = velocity !== 0 ? distanceToExit / -velocity : Infinity

  return {
    wordId: '', // Will be set by caller
    isVisible,
    distanceToCenter,
    percentVisible,
    predictedEntry: Math.max(0, predictedEntry),
    predictedCenter: Math.max(0, predictedCenter),
    predictedExit: Math.max(0, predictedExit)
  }
}

/**
 * Get all words that will be visible within prediction window
 */
export function getUpcomingWords(
  wordElements: Map<string, HTMLElement>,
  scrollState: ScrollState,
  predictionTime: number = 500
): WordVisibility[] {
  const viewport = getViewport()
  const upcoming: WordVisibility[] = []

  for (const [wordId, element] of wordElements) {
    const rect = element.getBoundingClientRect()
    const visibility = calculateWordVisibility(rect, scrollState, viewport)
    visibility.wordId = wordId

    // Include if currently visible or will be within prediction window
    if (visibility.isVisible || visibility.predictedEntry < predictionTime) {
      upcoming.push(visibility)
    }
  }

  // Sort by predicted center time (closest first)
  upcoming.sort((a, b) => a.predictedCenter - b.predictedCenter)

  return upcoming
}

/**
 * Check if a word should activate its effect
 */
export function shouldActivateWord(
  visibility: WordVisibility,
  activationThreshold: number,
  preActivationTime: number
): boolean {
  // Activate if:
  // 1. Word is visible and close to center
  // 2. OR word will reach center within preActivation time

  const closeToCenter =
    visibility.isVisible &&
    Math.abs(visibility.distanceToCenter) < window.innerHeight * activationThreshold

  const approachingCenter =
    visibility.predictedCenter > 0 &&
    visibility.predictedCenter < preActivationTime

  return closeToCenter || approachingCenter
}

// ═══════════════════════════════════════════════════════════════════
// DOM POSITION TO WEBGL CONVERSION
// ═══════════════════════════════════════════════════════════════════

/**
 * Convert DOM coordinates to WebGL normalized coordinates (-1 to 1)
 */
export function domToWebGL(
  rect: DOMRect
): { x: number; y: number; z: number } {
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  return {
    x: (centerX / window.innerWidth) * 2 - 1,
    y: -((centerY / window.innerHeight) * 2 - 1), // Flip Y for WebGL
    z: 0
  }
}

/**
 * Convert DOM position to Three.js world coordinates
 */
export function domToThreeWorld(
  rect: DOMRect,
  camera: { fov: number; aspect: number; position: { z: number } }
): { x: number; y: number; z: number } {
  const normalized = domToWebGL(rect)

  // Calculate visible height at z=0
  const fovRad = (camera.fov * Math.PI) / 180
  const visibleHeight = 2 * Math.tan(fovRad / 2) * camera.position.z
  const visibleWidth = visibleHeight * camera.aspect

  return {
    x: normalized.x * (visibleWidth / 2),
    y: normalized.y * (visibleHeight / 2),
    z: 0
  }
}

// ═══════════════════════════════════════════════════════════════════
// SCROLL LISTENER HOOK
// ═══════════════════════════════════════════════════════════════════

type ScrollCallback = (state: ScrollState) => void

let scrollCallbacks: ScrollCallback[] = []
let rafId: number | null = null
let isListening = false

function handleScroll(event: Event) {
  const scrollTop =
    event.target === document
      ? window.scrollY
      : (event.target as HTMLElement).scrollTop

  const state = updateScrollState(scrollTop)

  for (const callback of scrollCallbacks) {
    callback(state)
  }
}

function throttledScrollHandler() {
  if (rafId) return

  rafId = requestAnimationFrame(() => {
    rafId = null
  })
}

/**
 * Start listening to scroll events
 */
export function startScrollTracking(
  callback: ScrollCallback,
  element?: HTMLElement
): () => void {
  scrollCallbacks.push(callback)

  if (!isListening) {
    const target = element || window
    target.addEventListener('scroll', handleScroll, { passive: true })
    isListening = true
  }

  // Return cleanup function
  return () => {
    scrollCallbacks = scrollCallbacks.filter((cb) => cb !== callback)
    if (scrollCallbacks.length === 0 && isListening) {
      const target = element || window
      target.removeEventListener('scroll', handleScroll)
      isListening = false
    }
  }
}

/**
 * Get smooth interpolated scroll position
 */
export function getSmoothScrollPosition(
  target: number,
  current: number,
  smoothing: number = 0.1
): number {
  return current + (target - current) * smoothing
}
