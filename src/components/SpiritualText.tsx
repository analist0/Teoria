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
// SPIRITUAL WORD COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface SpiritualWordProps {
  word: SpiritualWord
  isActive: boolean
  onActivate: (wordId: string) => void
  onDeactivate: (wordId: string) => void
}

const SpiritualWordComponent = memo(
  forwardRef<HTMLSpanElement, SpiritualWordProps>(
    ({ word, isActive }, ref) => {
      const visuals = word.sefirah ? SEFIROT_VISUALS[word.sefirah] : null

      const getWordClass = () => {
        const classes = [styles.word]
        if (word.type === 'שם') classes.push(styles.divineName)
        if (word.type === 'כוונה') classes.push(styles.kavvanah)
        if (isActive) classes.push(styles.active)
        return classes.join(' ')
      }

      const wordStyle = visuals
        ? ({
            '--glow-color': visuals.primaryColor,
            '--secondary-color': visuals.secondaryColor
          } as React.CSSProperties)
        : {}

      return (
        <motion.span
          ref={ref}
          className={getWordClass()}
          style={wordStyle}
          data-word-id={word.id}
          data-sefirah={word.sefirah}
          data-type={word.type}
          initial={{ opacity: 0.8 }}
          animate={{
            opacity: isActive ? 1 : 0.85,
            scale: isActive ? 1.02 : 1,
            textShadow: isActive && visuals
              ? `0 0 20px ${visuals.primaryColor}, 0 0 40px ${visuals.primaryColor}50`
              : 'none'
          }}
          transition={{ duration: 0.3 }}
        >
          {word.text}
          {isActive && word.kavvanah && (
            <motion.span
              className={styles.kavvanahTooltip}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {word.kavvanah}
            </motion.span>
          )}
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
  onWordActivate: (wordId: string) => void
  onWordDeactivate: (wordId: string) => void
  registerWordRef: (wordId: string, element: HTMLElement | null) => void
}

const SpiritualVerseComponent = memo(
  ({ verse, activeWords, onWordActivate, onWordDeactivate, registerWordRef }: SpiritualVerseProps) => {
    return (
      <p className={styles.verse} data-verse-id={verse.id}>
        {verse.words.map((word) => (
          <SpiritualWordComponent
            key={word.id}
            ref={(el) => registerWordRef(word.id, el)}
            word={word}
            isActive={activeWords.has(word.id)}
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
}

export function SpiritualTextComponent({
  text,
  className
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
    [
      findWord,
      addAttractor,
      activateAttractor,
      setCurrentSefirah,
      handleWordDeactivate
    ]
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
    })

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
