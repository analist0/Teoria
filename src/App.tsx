/**
 * 🧬 Spiritual Light Engine - Main Application
 *
 * מנוע האור הרוחני - אפליקציית סידור אינטראקטיבית
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { SpiritualCanvas } from '@/components/SpiritualCanvas'
import { SpiritualTextComponent } from '@/components/SpiritualText'
import { ControlPanel } from '@/components/ControlPanel'
import { ALL_PRAYERS } from '@/data/prayers'
import type { SpiritualText, Sefirah, SpiritualWord } from '@/engine/types'
import { SEFIROT_VISUALS } from '@/engine/sefirot'
import { useCurrentSefirah, useSpiritualStore } from '@/stores/spiritualStore'
import '@/styles/global.css'

// ═══════════════════════════════════════════════════════════════════
// PRAYER SELECTOR
// ═══════════════════════════════════════════════════════════════════

interface PrayerSelectorProps {
  prayers: SpiritualText[]
  selectedId: string
  onSelect: (prayer: SpiritualText) => void
}

function PrayerSelector({ prayers, selectedId, onSelect }: PrayerSelectorProps) {
  return (
    <nav style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      background: 'rgba(10, 10, 15, 0.9)',
      padding: '1rem',
      borderRadius: '12px',
      border: '1px solid rgba(100, 150, 255, 0.2)',
      backdropFilter: 'blur(10px)'
    }}>
      <span style={{
        fontSize: '0.85rem',
        color: '#888',
        marginBottom: '0.5rem'
      }}>
        בחר תפילה:
      </span>
      {prayers.map((prayer) => (
        <button
          key={prayer.id}
          onClick={() => onSelect(prayer)}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.95rem',
            color: selectedId === prayer.id ? '#ffffff' : '#aabbdd',
            background: selectedId === prayer.id
              ? 'linear-gradient(135deg, rgba(68, 136, 255, 0.3), rgba(136, 170, 255, 0.1))'
              : 'transparent',
            border: '1px solid',
            borderColor: selectedId === prayer.id
              ? 'rgba(100, 150, 255, 0.5)'
              : 'transparent',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'right',
            transition: 'all 0.2s ease'
          }}
        >
          {prayer.title}
        </button>
      ))}
    </nav>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SEFIRAH INDICATOR
// ═══════════════════════════════════════════════════════════════════

interface SefirahIndicatorProps {
  sefirah: Sefirah | null
}

function SefirahIndicator({ sefirah }: SefirahIndicatorProps) {
  if (!sefirah) return null

  const visuals = SEFIROT_VISUALS[sefirah]

  return (
    <div style={{
      position: 'fixed',
      top: '1rem',
      left: '1rem',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1.5rem',
      background: 'rgba(10, 10, 15, 0.9)',
      borderRadius: '24px',
      border: `1px solid ${visuals.primaryColor}40`,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: visuals.primaryColor,
        boxShadow: `0 0 10px ${visuals.primaryColor}, 0 0 20px ${visuals.primaryColor}80`,
        animation: 'pulse 2s ease-in-out infinite'
      }} />
      <span style={{
        fontSize: '1rem',
        color: visuals.primaryColor,
        fontWeight: 500
      }}>
        {sefirah}
      </span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// KAVVANAH DISPLAY
// ═══════════════════════════════════════════════════════════════════

interface KavvanahDisplayProps {
  word: SpiritualWord | null
  sefirah: Sefirah | null
}

function KavvanahDisplay({ word, sefirah }: KavvanahDisplayProps) {
  if (!word || !word.kavvanah) return null

  const visuals = sefirah ? SEFIROT_VISUALS[sefirah] : null

  return (
    <div style={{
      position: 'fixed',
      top: '5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
      padding: '1rem 2rem',
      background: 'rgba(10, 10, 20, 0.95)',
      borderRadius: '12px',
      border: `1px solid ${visuals?.primaryColor || '#4488ff'}40`,
      backdropFilter: 'blur(10px)',
      boxShadow: `0 4px 20px rgba(0, 0, 0, 0.5), 0 0 40px ${visuals?.primaryColor || '#4488ff'}20`,
      textAlign: 'center',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        fontSize: '1.5rem',
        color: visuals?.primaryColor || '#4488ff',
        fontWeight: 600,
        marginBottom: '0.5rem',
        textShadow: `0 0 20px ${visuals?.primaryColor || '#4488ff'}80`
      }}>
        {word.text}
      </div>
      <div style={{
        fontSize: '1rem',
        color: '#c0d0ee',
        direction: 'ltr'
      }}>
        {word.kavvanah}
      </div>
      {word.gematria && (
        <div style={{
          fontSize: '0.85rem',
          color: '#888',
          marginTop: '0.5rem'
        }}>
          גימטריה: {word.gematria}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════

export default function App() {
  const [selectedPrayer, setSelectedPrayer] = useState<SpiritualText>(ALL_PRAYERS[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [activeWord, setActiveWord] = useState<SpiritualWord | null>(null)

  const playbackRef = useRef<NodeJS.Timeout | null>(null)

  // Use sefirah from global store to stay in sync with word activations
  const currentSefirah = useCurrentSefirah()
  const setCurrentSefirah = useSpiritualStore((state) => state.setCurrentSefirah)

  // Get all words for total count
  const allWords = useMemo(() => {
    const words: SpiritualWord[] = []
    for (const verse of selectedPrayer.verses) {
      words.push(...verse.words)
    }
    return words
  }, [selectedPrayer])

  // Set initial sefirah when prayer changes
  useEffect(() => {
    if (selectedPrayer.defaultSefirah) {
      setCurrentSefirah(selectedPrayer.defaultSefirah)
    }
    setCurrentWordIndex(0)
    setIsPlaying(false)
    setActiveWord(null)
  }, [selectedPrayer, setCurrentSefirah])

  // Auto-play logic
  useEffect(() => {
    if (isPlaying && currentWordIndex < allWords.length) {
      const currentWord = allWords[currentWordIndex]
      const isSignificant = currentWord.type !== 'רגיל' || currentWord.kavvanah

      // Update active word if significant
      if (isSignificant) {
        setActiveWord(currentWord)
        if (currentWord.sefirah) {
          setCurrentSefirah(currentWord.sefirah)
        }
      }

      // Scroll to word
      const wordElement = document.querySelector(`[data-word-id="${currentWord.id}"]`)
      if (wordElement) {
        wordElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }

      // Calculate delay based on word type and speed
      const baseDelay = isSignificant ? currentWord.duration : 500
      const delay = baseDelay / playbackSpeed

      playbackRef.current = setTimeout(() => {
        if (currentWordIndex < allWords.length - 1) {
          setCurrentWordIndex(prev => prev + 1)
        } else {
          setIsPlaying(false)
          setActiveWord(null)
        }
      }, delay)
    }

    return () => {
      if (playbackRef.current) {
        clearTimeout(playbackRef.current)
      }
    }
  }, [isPlaying, currentWordIndex, allWords, playbackSpeed, setCurrentSefirah])

  // Clear active word after delay when not playing
  useEffect(() => {
    if (!isPlaying && activeWord) {
      const timeout = setTimeout(() => {
        setActiveWord(null)
      }, 3000)
      return () => clearTimeout(timeout)
    }
  }, [isPlaying, activeWord])

  const handlePrayerSelect = useCallback((prayer: SpiritualText) => {
    setSelectedPrayer(prayer)
  }, [])

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed)
  }, [])

  const handleSeek = useCallback((index: number) => {
    setCurrentWordIndex(Math.max(0, Math.min(index, allWords.length - 1)))
  }, [allWords.length])

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* WebGL Canvas Layer */}
      <SpiritualCanvas
        sefirah={currentSefirah || 'מלכות'}
        showBackground={true}
      />

      {/* Prayer Selector */}
      <PrayerSelector
        prayers={ALL_PRAYERS}
        selectedId={selectedPrayer.id}
        onSelect={handlePrayerSelect}
      />

      {/* Sefirah Indicator */}
      <SefirahIndicator sefirah={currentSefirah} />

      {/* Kavvanah Display */}
      <KavvanahDisplay word={activeWord} sefirah={currentSefirah} />

      {/* Prayer Text */}
      <SpiritualTextComponent
        text={selectedPrayer}
      />

      {/* Control Panel */}
      <ControlPanel
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        speed={playbackSpeed}
        onSpeedChange={handleSpeedChange}
        currentWordIndex={currentWordIndex}
        totalWords={allWords.length}
        onSeek={handleSeek}
        currentSefirah={currentSefirah}
      />

      {/* Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
