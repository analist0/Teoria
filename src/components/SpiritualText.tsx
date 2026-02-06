/**
 * 📜 Spiritual Text Component
 *
 * רכיב הצגת טקסט קדוש עם זיהוי והפעלה אוטומטית של אפקטים
 */

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  forwardRef,
  memo
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SpiritualText, SpiritualWord, SpiritualVerse } from '@/engine/types'
import { SEFIROT_VISUALS } from '@/engine/sefirot'
import { useSpiritualStore } from '@/stores/spiritualStore'
import {
  startScrollTracking,
  getViewport,
  calculateWordVisibility,
  shouldActivateWord,
  domToThreeWorld
} from '@/engine/scrollPrediction'
import styles from '@/styles/SpiritualText.module.css'

// ═══════════════════════════════════════════════════════════════════
// LIGHT RAYS COMPONENT - קווי אור מעל המילה
// ═══════════════════════════════════════════════════════════════════

function LightRays({ color }: { color: string }) {
  return (
    <div className={styles.lightRaysContainer}>
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className={styles.lightRay}
          style={{
            '--ray-index': i,
            '--ray-color': color,
            '--ray-delay': `${i * 0.1}s`,
            '--ray-angle': `${-45 + i * 15}deg`
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SPIRITUAL WORD COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface SpiritualWordProps {
  word: SpiritualWord
  isActive: boolean
  isPlayerActive: boolean // From the player
  isApproaching: boolean // Next word warning
  onActivate: (wordId: string) => void
  onDeactivate: (wordId: string) => void
}

const SpiritualWordComponent = memo(
  forwardRef<HTMLSpanElement, SpiritualWordProps>(
    ({ word, isActive, isPlayerActive, isApproaching }, ref) => {
      const visuals = word.sefirah ? SEFIROT_VISUALS[word.sefirah] : null
      const showHighlight = isActive || isPlayerActive

      const getWordClass = () => {
        const classes = [styles.word]
        if (word.type === 'שם') classes.push(styles.divineName)
        if (word.type === 'כוונה') classes.push(styles.kavvanah)
        if (showHighlight) classes.push(styles.active)
        if (isPlayerActive) classes.push(styles.playerActive)
        if (isApproaching) classes.push(styles.approaching)
        return classes.join(' ')
      }

      const wordStyle = visuals
        ? ({
            '--glow-color': visuals.primaryColor,
            '--secondary-color': visuals.secondaryColor
          } as React.CSSProperties)
        : ({
            '--glow-color': '#4488ff',
            '--secondary-color': '#88aaff'
          } as React.CSSProperties)

      return (
        <motion.span
          ref={ref}
          className={getWordClass()}
          style={wordStyle}
          data-word-id={word.id}
          data-sefirah={word.sefirah}
          data-type={word.type}
          initial={{ opacity: 0.85 }}
          animate={{
            opacity: showHighlight ? 1 : 0.85,
            scale: isPlayerActive ? 1.15 : showHighlight ? 1.05 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Light rays for active player word */}
          {isPlayerActive && word.type !== 'רגיל' && (
            <LightRays color={visuals?.primaryColor || '#4488ff'} />
          )}

          {/* Approaching indicator */}
          {isApproaching && (
            <span className={styles.approachingPulse} style={{ '--pulse-color': visuals?.primaryColor || '#4488ff' } as React.CSSProperties} />
          )}

          {word.text}
        </motion.span>
      )
    }
  )
)

SpiritualWordComponent.displayName = 'SpiritualWord'

// ═══════════════════════════════════════════════════════════════════
// SPIRITUAL VERSE COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface SpiritualVerseProps {
  verse: SpiritualVerse
  activeWords: Set<string>
  playerActiveWordId: string | null
  approachingWordId: string | null
  onWordActivate: (wordId: string) => void
  onWordDeactivate: (wordId: string) => void
  registerWordRef: (wordId: string, element: HTMLElement | null) => void
}

const SpiritualVerseComponent = memo(
  ({ verse, activeWords, playerActiveWordId, approachingWordId, onWordActivate, onWordDeactivate, registerWordRef }: SpiritualVerseProps) => {
    return (
      <p className={styles.verse} data-verse-id={verse.id}>
        {verse.words.map((word) => (
          <SpiritualWordComponent
            key={word.id}
            ref={(el) => registerWordRef(word.id, el)}
            word={word}
            isActive={activeWords.has(word.id)}
            isPlayerActive={playerActiveWordId === word.id}
            isApproaching={approachingWordId === word.id}
            onActivate={onWordActivate}
            onDeactivate={onWordDeactivate}
          />
        ))}
        {verse.source && (
          <span className={styles.source}>({verse.source})</span>
        )}
      </p>
    )
  }
)

SpiritualVerseComponent.displayName = 'SpiritualVerse'

// ═══════════════════════════════════════════════════════════════════
// MAIN SPIRITUAL TEXT COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface SpiritualTextComponentProps {
  text: SpiritualText
  className?: string
  playerActiveWordId?: string | null
  approachingWordId?: string | null
}

export function SpiritualTextComponent({
  text,
  className,
  playerActiveWordId = null,
  approachingWordId = null
}: SpiritualTextComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<Map<string, HTMLElement>>(new Map())
  const [activeWords, setActiveWords] = useState<Set<string>>(new Set())

  const {
    registerWordElement,
    unregisterWordElement,
    addAttractor,
    removeAttractor,
    activateAttractor,
    deactivateAttractor,
    setCurrentSefirah
  } = useSpiritualStore()

  // Register word refs
  const registerWordRef = useCallback(
    (wordId: string, element: HTMLElement | null) => {
      if (element) {
        wordRefs.current.set(wordId, element)
        registerWordElement(wordId, element)
      } else {
        wordRefs.current.delete(wordId)
        unregisterWordElement(wordId)
      }
    },
    [registerWordElement, unregisterWordElement]
  )

  // Find word by ID
  const findWord = useCallback(
    (wordId: string): SpiritualWord | undefined => {
      for (const verse of text.verses) {
        const word = verse.words.find((w) => w.id === wordId)
        if (word) return word
      }
      return undefined
    },
    [text]
  )

  // Activate word effect
  const handleWordActivate = useCallback(
    (wordId: string) => {
      const word = findWord(wordId)
      const element = wordRefs.current.get(wordId)

      if (!word || !element || word.type === 'רגיל') return

      const rect = element.getBoundingClientRect()
      const position = domToThreeWorld(rect, {
        fov: 75,
        aspect: window.innerWidth / window.innerHeight,
        position: { z: 5 }
      })

      setActiveWords((prev) => new Set([...prev, wordId]))

      if (word.sefirah) {
        setCurrentSefirah(word.sefirah)
      }

      // Create attractor for this word
      addAttractor({
        id: `attractor_${wordId}`,
        wordId,
        position,
        domPosition: {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        },
        sefirah: word.sefirah || 'מלכות',
        energyLevel: word.energyLevel,
        active: true,
        phase: 'awakening',
        timeActivated: Date.now()
      })

      activateAttractor(`attractor_${wordId}`)

      // Auto deactivate after duration
      setTimeout(() => {
        handleWordDeactivate(wordId)
      }, word.duration)
    },
    [findWord, addAttractor, activateAttractor, setCurrentSefirah]
  )

  // Deactivate word effect
  const handleWordDeactivate = useCallback(
    (wordId: string) => {
      setActiveWords((prev) => {
        const next = new Set(prev)
        next.delete(wordId)
        return next
      })

      deactivateAttractor(`attractor_${wordId}`)

      // Remove attractor after fade
      setTimeout(() => {
        removeAttractor(`attractor_${wordId}`)
      }, 800)
    },
    [deactivateAttractor, removeAttractor]
  )

  // Scroll tracking and word activation
  useEffect(() => {
    const cleanup = startScrollTracking((scrollState) => {
      const viewport = getViewport()

      for (const [wordId, element] of wordRefs.current) {
        const word = findWord(wordId)
        if (!word || word.type === 'רגיל') continue

        const rect = element.getBoundingClientRect()
        const visibility = calculateWordVisibility(rect, scrollState, viewport)
        visibility.wordId = wordId

        const shouldActivate = shouldActivateWord(visibility, 0.3, 300)

        if (shouldActivate && !activeWords.has(wordId)) {
          handleWordActivate(wordId)
        }
      }
    }, containerRef.current || undefined)

    return cleanup
  }, [findWord, activeWords, handleWordActivate])

  // Set initial sefirah
  useEffect(() => {
    if (text.defaultSefirah) {
      setCurrentSefirah(text.defaultSefirah)
    }
  }, [text.defaultSefirah, setCurrentSefirah])

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className || ''}`}
    >
      <h1 className={styles.title}>{text.title}</h1>

      <div className={styles.textContent}>
        <AnimatePresence>
          {text.verses.map((verse) => (
            <SpiritualVerseComponent
              key={verse.id}
              verse={verse}
              activeWords={activeWords}
              playerActiveWordId={playerActiveWordId}
              approachingWordId={approachingWordId}
              onWordActivate={handleWordActivate}
              onWordDeactivate={handleWordDeactivate}
              registerWordRef={registerWordRef}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default SpiritualTextComponent
