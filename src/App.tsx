/**
 * 🧬 Spiritual Light Engine - Main Application
 *
 * מנוע האור הרוחני - אפליקציית סידור אינטראקטיבית
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
// KAVVANAH OVERLAY - תצוגת כוונה מרכזית מרשימה
// ═══════════════════════════════════════════════════════════════════

interface KavvanahOverlayProps {
  word: SpiritualWord | null
  sefirah: Sefirah | null
}

function KavvanahOverlay({ word, sefirah }: KavvanahOverlayProps) {
  const visuals = sefirah ? SEFIROT_VISUALS[sefirah] : null
  const color = visuals?.primaryColor || '#4488ff'

  return (
    <AnimatePresence>
      {word && word.kavvanah && (
        <motion.div
          key={word.id}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 200,
            padding: '2rem 3rem',
            background: 'rgba(5, 5, 15, 0.98)',
            borderRadius: '24px',
            border: `2px solid ${color}60`,
            backdropFilter: 'blur(20px)',
            boxShadow: `
              0 0 60px ${color}40,
              0 0 120px ${color}20,
              0 8px 32px rgba(0, 0, 0, 0.8),
              inset 0 0 60px ${color}10
            `,
            textAlign: 'center',
            maxWidth: '90vw',
            minWidth: '280px'
          }}
        >
          {/* Decorative light lines above */}
          <div style={{
            position: 'absolute',
            top: '-40px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            justifyContent: 'center'
          }}>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 30, opacity: 0.8 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                style={{
                  width: '2px',
                  background: `linear-gradient(to top, ${color}, transparent)`,
                  borderRadius: '2px',
                  transform: `rotate(${-20 + i * 10}deg)`
                }}
              />
            ))}
          </div>

          {/* Main word */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '1rem',
              textShadow: `
                0 0 20px ${color},
                0 0 40px ${color}80,
                0 0 60px ${color}60
              `,
              fontFamily: "'Frank Ruhl Libre', serif"
            }}
          >
            {word.text}
          </motion.div>

          {/* Kavvanah text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: '1.3rem',
              color: '#c8d8f8',
              lineHeight: 1.8,
              direction: 'rtl',
              fontFamily: "'Frank Ruhl Libre', serif",
              padding: '0.5rem 0'
            }}
          >
            {word.kavvanah}
          </motion.div>

          {/* Divine name type indicator */}
          {word.divineName && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: `${color}20`,
                borderRadius: '20px',
                display: 'inline-block',
                fontSize: '0.9rem',
                color: color
              }}
            >
              שם קדוש: {word.divineName}
            </motion.div>
          )}

          {/* Gematria if available */}
          {word.gematria && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              style={{
                marginTop: '0.75rem',
                fontSize: '0.95rem',
                color: '#8898b8'
              }}
            >
              גימטריה: {word.gematria}
            </motion.div>
          )}

          {/* Pulsing ring effect */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              top: '-4px',
              left: '-4px',
              right: '-4px',
              bottom: '-4px',
              borderRadius: '28px',
              border: `2px solid ${color}`,
              pointerEvents: 'none'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
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

  // Find next important word (for approaching effect)
  const approachingWord = useMemo(() => {
    for (let i = currentWordIndex + 1; i < Math.min(currentWordIndex + 5, allWords.length); i++) {
      const word = allWords[i]
      if (word.type !== 'רגיל' || word.kavvanah) {
        return word
      }
    }
    return null
  }, [currentWordIndex, allWords])

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
      } else {
        // Clear active word for regular words
        setActiveWord(null)
      }

      // Scroll to word
      const wordElement = document.querySelector(`[data-word-id="${currentWord.id}"]`)
      if (wordElement) {
        wordElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }

      // Calculate delay based on word type and speed
      const baseDelay = isSignificant ? (currentWord.duration || 2000) : 400
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

  // Clear active word after delay when paused
  useEffect(() => {
    if (!isPlaying && activeWord) {
      const timeout = setTimeout(() => {
        setActiveWord(null)
      }, 5000)
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
    setActiveWord(null)
  }, [allWords.length])

  // Get current word ID for text highlighting
  const currentWord = allWords[currentWordIndex]
  const playerActiveWordId = isPlaying && currentWord ? currentWord.id : null

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

      {/* Kavvanah Overlay - Large centered display */}
      <KavvanahOverlay word={activeWord} sefirah={currentSefirah} />

      {/* Prayer Text - with active word highlighting */}
      <SpiritualTextComponent
        text={selectedPrayer}
        playerActiveWordId={playerActiveWordId}
        approachingWordId={approachingWord?.id || null}
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
      `}</style>
    </div>
  )
}
