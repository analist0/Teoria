/**
 * 🧬 Spiritual Engine Hook
 *
 * React hook for using the spiritual light engine
 */

import { useEffect, useCallback, useRef } from 'react'
import { useSpiritualStore } from '@/stores/spiritualStore'
import { domToThreeWorld } from '@/engine/scrollPrediction'
import type { SpiritualWord, AttractorNode } from '@/engine/types'

export function useSpiritualEngine() {
  const {
    isInitialized,
    isRunning,
    currentSefirah,
    activeAttractors,
    wordElements,
    initialize,
    start,
    stop,
    setCurrentSefirah,
    addAttractor,
    removeAttractor,
    activateAttractor,
    deactivateAttractor,
    registerWordElement,
    unregisterWordElement
  } = useSpiritualStore()

  const activeTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Initialize engine on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [isInitialized, initialize])

  // Create attractor for a word
  const createWordAttractor = useCallback(
    (word: SpiritualWord, element: HTMLElement) => {
      const rect = element.getBoundingClientRect()
      const position = domToThreeWorld(rect, {
        fov: 75,
        aspect: window.innerWidth / window.innerHeight,
        position: { z: 5 }
      })

      const attractor: AttractorNode = {
        id: `attractor_${word.id}`,
        wordId: word.id,
        position,
        domPosition: {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        },
        sefirah: word.sefirah || 'מלכות',
        energyLevel: word.energyLevel,
        active: false,
        phase: 'dormant'
      }

      addAttractor(attractor)
      return attractor.id
    },
    [addAttractor]
  )

  // Activate a word effect
  const activateWord = useCallback(
    (word: SpiritualWord, element: HTMLElement) => {
      const attractorId = `attractor_${word.id}`

      // Check if attractor exists
      const existing = activeAttractors.find((a) => a.id === attractorId)
      if (!existing) {
        createWordAttractor(word, element)
      }

      // Update sefirah
      if (word.sefirah) {
        setCurrentSefirah(word.sefirah)
      }

      // Activate
      activateAttractor(attractorId)

      // Auto-deactivate after duration
      const existingTimeout = activeTimeouts.current.get(word.id)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      const timeout = setTimeout(() => {
        deactivateWord(word.id)
      }, word.duration)

      activeTimeouts.current.set(word.id, timeout)
    },
    [activeAttractors, createWordAttractor, setCurrentSefirah, activateAttractor]
  )

  // Deactivate a word effect
  const deactivateWord = useCallback(
    (wordId: string) => {
      const attractorId = `attractor_${wordId}`

      deactivateAttractor(attractorId)

      // Clear timeout
      const timeout = activeTimeouts.current.get(wordId)
      if (timeout) {
        clearTimeout(timeout)
        activeTimeouts.current.delete(wordId)
      }

      // Remove attractor after fade animation
      setTimeout(() => {
        removeAttractor(attractorId)
      }, 800)
    },
    [deactivateAttractor, removeAttractor]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      for (const timeout of activeTimeouts.current.values()) {
        clearTimeout(timeout)
      }
      activeTimeouts.current.clear()
    }
  }, [])

  return {
    isInitialized,
    isRunning,
    currentSefirah,
    activeAttractors,
    wordElements,
    start,
    stop,
    setCurrentSefirah,
    registerWordElement,
    unregisterWordElement,
    activateWord,
    deactivateWord,
    createWordAttractor
  }
}

export default useSpiritualEngine
