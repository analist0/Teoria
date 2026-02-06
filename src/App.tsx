/**
 * 🧬 Spiritual Light Engine - Main Application
 *
 * סידור דיגיטלי מקצועי עם כוונות
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ALL_PRAYERS } from '@/data/prayers'
import { parseSpiritualText } from '@/engine/textEngine'
import type { SpiritualText, SpiritualWord } from '@/engine/types'
import { SEFIROT_VISUALS } from '@/engine/sefirot'
import '@/styles/global.css'

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface Category {
  id: string
  name: string
  isBuiltIn: boolean
  prayers: SpiritualText[]
}

// ═══════════════════════════════════════════════════════════════════
// LOCAL STORAGE
// ═══════════════════════════════════════════════════════════════════

const CATEGORIES_KEY = 'siddur_categories'

function loadCategories(): Category[] {
  try {
    const saved = localStorage.getItem(CATEGORIES_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return []
}

function saveCategories(categories: Category[]): void {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories.filter(c => !c.isBuiltIn)))
}

// ═══════════════════════════════════════════════════════════════════
// DEFAULT CATEGORIES
// ═══════════════════════════════════════════════════════════════════

function getDefaultCategories(): Category[] {
  return [
    {
      id: 'shema',
      name: 'קריאת שמע',
      isBuiltIn: true,
      prayers: ALL_PRAYERS.filter(p => p.title.includes('שמע'))
    },
    {
      id: 'amidah',
      name: 'תפילת עמידה',
      isBuiltIn: true,
      prayers: ALL_PRAYERS.filter(p => p.title.includes('עמידה') || p.title.includes('אבות'))
    },
    {
      id: 'kedushah',
      name: 'קדושה',
      isBuiltIn: true,
      prayers: ALL_PRAYERS.filter(p => p.title.includes('קדושה'))
    },
    {
      id: 'tehilim',
      name: 'תהילים',
      isBuiltIn: true,
      prayers: ALL_PRAYERS.filter(p => p.title.includes('תהילים') || p.title.includes('מזמור'))
    },
    {
      id: 'brachot',
      name: 'ברכות',
      isBuiltIn: true,
      prayers: ALL_PRAYERS.filter(p => p.title.includes('ברכת') || p.title.includes('אנא'))
    }
  ]
}

// ═══════════════════════════════════════════════════════════════════
// CATEGORY SIDEBAR
// ═══════════════════════════════════════════════════════════════════

interface CategorySidebarProps {
  categories: Category[]
  selectedCategory: string | null
  onSelectCategory: (id: string) => void
  onAddCategory: () => void
  onDeleteCategory: (id: string) => void
}

function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  onAddCategory,
  onDeleteCategory
}: CategorySidebarProps) {
  return (
    <aside style={{
      width: '200px',
      background: '#0a0a12',
      borderLeft: '1px solid #222',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      overflowY: 'auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem'
      }}>
        <h3 style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>קטגוריות</h3>
        <button
          onClick={onAddCategory}
          style={{
            background: 'none',
            border: 'none',
            color: '#4488ff',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1
          }}
        >
          +
        </button>
      </div>

      {categories.map((cat) => (
        <div
          key={cat.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <button
            onClick={() => onSelectCategory(cat.id)}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: selectedCategory === cat.id ? '#1a1a2e' : 'transparent',
              border: selectedCategory === cat.id ? '1px solid #333' : '1px solid transparent',
              borderRadius: '8px',
              color: selectedCategory === cat.id ? '#fff' : '#aaa',
              textAlign: 'right',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            {cat.name}
          </button>
          {!cat.isBuiltIn && (
            <button
              onClick={() => onDeleteCategory(cat.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ff4444',
                cursor: 'pointer',
                padding: '0.25rem',
                fontSize: '0.8rem'
              }}
            >
              ✕
            </button>
          )}
        </div>
      ))}
    </aside>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PRAYER LIST
// ═══════════════════════════════════════════════════════════════════

interface PrayerListProps {
  prayers: SpiritualText[]
  selectedPrayer: string | null
  onSelectPrayer: (prayer: SpiritualText) => void
  onAddPrayer: () => void
}

function PrayerList({ prayers, selectedPrayer, onSelectPrayer, onAddPrayer }: PrayerListProps) {
  if (prayers.length === 0) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#666'
      }}>
        <p>אין תפילות בקטגוריה זו</p>
        <button
          onClick={onAddPrayer}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: '#1a1a2e',
            border: '1px solid #333',
            borderRadius: '8px',
            color: '#aaa',
            cursor: 'pointer'
          }}
        >
          + הוסף תפילה
        </button>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      padding: '1rem'
    }}>
      {prayers.map((prayer) => (
        <button
          key={prayer.id}
          onClick={() => onSelectPrayer(prayer)}
          style={{
            padding: '1rem',
            background: selectedPrayer === prayer.id ? '#1a1a2e' : '#0d0d18',
            border: selectedPrayer === prayer.id ? '1px solid #4488ff40' : '1px solid #222',
            borderRadius: '8px',
            color: selectedPrayer === prayer.id ? '#fff' : '#ccc',
            textAlign: 'right',
            cursor: 'pointer',
            fontSize: '1.1rem'
          }}
        >
          {prayer.title}
        </button>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// KAVVANAH TOOLTIP - כוונה קטנה מעל המילה
// ═══════════════════════════════════════════════════════════════════

interface KavvanahTooltipProps {
  word: SpiritualWord
  position: { x: number; y: number }
  onFadeComplete: () => void
}

function KavvanahTooltip({ word, position, onFadeComplete }: KavvanahTooltipProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Stay visible for 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const color = word.sefirah ? SEFIROT_VISUALS[word.sefirah].primaryColor : '#4488ff'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isVisible ? 1 : 0, y: 0 }}
      transition={{ duration: isVisible ? 0.2 : 0.5 }}
      onAnimationComplete={() => {
        if (!isVisible) onFadeComplete()
      }}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y - 10,
        transform: 'translate(-50%, -100%)',
        zIndex: 1000,
        pointerEvents: 'none'
      }}
    >
      <div style={{
        background: '#0a0a15',
        border: `1px solid ${color}50`,
        borderRadius: '8px',
        padding: '0.5rem 0.75rem',
        boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 20px ${color}20`,
        maxWidth: '280px',
        textAlign: 'center'
      }}>
        {/* Kavvanah text */}
        <div style={{
          fontSize: '0.9rem',
          color: '#d0d8e8',
          lineHeight: 1.5,
          direction: 'rtl'
        }}>
          {word.kavvanah}
        </div>

        {/* Gematria */}
        {word.gematria && (
          <div style={{
            marginTop: '0.25rem',
            fontSize: '0.75rem',
            color: color
          }}>
            גימטריה: {word.gematria}
          </div>
        )}

        {/* Arrow pointing down */}
        <div style={{
          position: 'absolute',
          bottom: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `6px solid ${color}50`
        }} />
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// BOOK VIEW - תצוגת ספר
// ═══════════════════════════════════════════════════════════════════

interface BookViewProps {
  prayer: SpiritualText | null
  currentWordIndex: number
  isPlaying: boolean
  activeKavvanot: Map<string, { word: SpiritualWord; position: { x: number; y: number } }>
  onRemoveKavvanah: (wordId: string) => void
}

function BookView({ prayer, currentWordIndex, isPlaying, activeKavvanot, onRemoveKavvanah }: BookViewProps) {
  if (!prayer) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        fontSize: '1.2rem'
      }}>
        בחר תפילה מהרשימה
      </div>
    )
  }

  // Get all words flat
  const allWords = useMemo(() => {
    const words: SpiritualWord[] = []
    for (const verse of prayer.verses) {
      words.push(...verse.words)
    }
    return words
  }, [prayer])

  const currentWord = allWords[currentWordIndex]

  return (
    <div style={{
      flex: 1,
      padding: '2rem',
      overflowY: 'auto',
      background: '#08080f'
    }}>
      {/* Title */}
      <h1 style={{
        textAlign: 'center',
        fontSize: '2rem',
        color: '#fff',
        marginBottom: '2rem',
        fontFamily: "'Frank Ruhl Libre', serif"
      }}>
        {prayer.title}
      </h1>

      {/* Verses */}
      <div style={{
        maxWidth: '700px',
        margin: '0 auto',
        background: '#0d0d18',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #1a1a2e'
      }}>
        {prayer.verses.map((verse) => (
          <p
            key={verse.id}
            style={{
              fontSize: '1.5rem',
              lineHeight: 2.2,
              textAlign: 'center',
              margin: '1rem 0',
              fontFamily: "'Frank Ruhl Libre', serif",
              color: '#e0e0f0'
            }}
          >
            {verse.words.map((word) => {
              const isCurrentWord = isPlaying && currentWord?.id === word.id
              const hasKavvanah = word.kavvanah && word.type !== 'רגיל'
              const color = word.sefirah ? SEFIROT_VISUALS[word.sefirah].primaryColor : '#4488ff'

              return (
                <span
                  key={word.id}
                  data-word-id={word.id}
                  style={{
                    display: 'inline',
                    margin: '0 0.15em',
                    color: isCurrentWord
                      ? '#fff'
                      : hasKavvanah
                        ? color
                        : '#e0e0f0',
                    fontWeight: hasKavvanah ? 600 : 400,
                    textShadow: isCurrentWord
                      ? `0 0 10px ${color}, 0 0 20px ${color}`
                      : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {word.text}
                </span>
              )
            })}
          </p>
        ))}
      </div>

      {/* Kavvanah Tooltips */}
      <AnimatePresence>
        {Array.from(activeKavvanot.entries()).map(([wordId, { word, position }]) => (
          <KavvanahTooltip
            key={wordId}
            word={word}
            position={position}
            onFadeComplete={() => onRemoveKavvanah(wordId)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PLAYER CONTROLS - פקדי נגן פשוטים
// ═══════════════════════════════════════════════════════════════════

interface PlayerControlsProps {
  isPlaying: boolean
  onPlayPause: () => void
  speed: number
  onSpeedChange: (speed: number) => void
  progress: number
  onSeek: (progress: number) => void
}

function PlayerControls({
  isPlaying,
  onPlayPause,
  speed,
  onSpeedChange,
  progress,
  onSeek
}: PlayerControlsProps) {
  return (
    <div style={{
      height: '80px',
      background: '#0a0a12',
      borderTop: '1px solid #222',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2rem',
      padding: '0 2rem'
    }}>
      {/* Progress bar */}
      <div
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          onSeek(x / rect.width)
        }}
        style={{
          flex: 1,
          maxWidth: '400px',
          height: '6px',
          background: '#222',
          borderRadius: '3px',
          cursor: 'pointer',
          overflow: 'hidden'
        }}
      >
        <div style={{
          width: `${progress * 100}%`,
          height: '100%',
          background: '#4488ff',
          borderRadius: '3px',
          transition: 'width 0.1s ease'
        }} />
      </div>

      {/* Play button */}
      <button
        onClick={onPlayPause}
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: '#4488ff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isPlaying ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Speed control */}
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {[0.5, 1, 1.5, 2].map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            style={{
              padding: '0.4rem 0.6rem',
              background: speed === s ? '#4488ff30' : 'transparent',
              border: speed === s ? '1px solid #4488ff50' : '1px solid #333',
              borderRadius: '4px',
              color: speed === s ? '#fff' : '#888',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ADD CATEGORY MODAL
// ═══════════════════════════════════════════════════════════════════

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string) => void
}

function AddCategoryModal({ isOpen, onClose, onSave }: AddCategoryModalProps) {
  const [name, setName] = useState('')

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0d0d18',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid #333',
          width: '300px'
        }}
      >
        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>הוסף קטגוריה</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="שם הקטגוריה"
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#1a1a2e',
            border: '1px solid #333',
            borderRadius: '8px',
            color: '#fff',
            marginBottom: '1rem',
            direction: 'rtl'
          }}
        />
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1.5rem',
              background: 'transparent',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#888',
              cursor: 'pointer'
            }}
          >
            ביטול
          </button>
          <button
            onClick={() => {
              if (name.trim()) {
                onSave(name.trim())
                setName('')
                onClose()
              }
            }}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#4488ff',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            שמור
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ADD PRAYER MODAL
// ═══════════════════════════════════════════════════════════════════

interface AddPrayerModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (title: string, text: string) => void
}

function AddPrayerModal({ isOpen, onClose, onSave }: AddPrayerModalProps) {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0d0d18',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid #333',
          width: '450px',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
      >
        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>הוסף תפילה</h3>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="כותרת התפילה"
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#1a1a2e',
            border: '1px solid #333',
            borderRadius: '8px',
            color: '#fff',
            marginBottom: '1rem',
            direction: 'rtl'
          }}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="טקסט התפילה (כל שורה = פסוק)"
          rows={10}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#1a1a2e',
            border: '1px solid #333',
            borderRadius: '8px',
            color: '#fff',
            marginBottom: '1rem',
            direction: 'rtl',
            resize: 'vertical',
            fontFamily: "'Frank Ruhl Libre', serif",
            fontSize: '1.1rem',
            lineHeight: 1.8
          }}
        />
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1.5rem',
              background: 'transparent',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#888',
              cursor: 'pointer'
            }}
          >
            ביטול
          </button>
          <button
            onClick={() => {
              if (title.trim() && text.trim()) {
                onSave(title.trim(), text.trim())
                setTitle('')
                setText('')
                onClose()
              }
            }}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#4488ff',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            שמור
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════

export default function App() {
  // Categories and prayers
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = loadCategories()
    return [...getDefaultCategories(), ...saved]
  })
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>('shema')
  const [selectedPrayer, setSelectedPrayer] = useState<SpiritualText | null>(null)

  // Modals
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddPrayer, setShowAddPrayer] = useState(false)

  // Player state
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)

  // Active kavvanot (word tooltips)
  const [activeKavvanot, setActiveKavvanot] = useState<Map<string, { word: SpiritualWord; position: { x: number; y: number } }>>(new Map())

  const playbackRef = useRef<NodeJS.Timeout | null>(null)

  // Get all words from selected prayer
  const allWords = useMemo(() => {
    if (!selectedPrayer) return []
    const words: SpiritualWord[] = []
    for (const verse of selectedPrayer.verses) {
      words.push(...verse.words)
    }
    return words
  }, [selectedPrayer])

  // Current category
  const selectedCategory = categories.find(c => c.id === selectedCategoryId)

  // Reset when prayer changes
  useEffect(() => {
    setCurrentWordIndex(0)
    setIsPlaying(false)
    setActiveKavvanot(new Map())
  }, [selectedPrayer])

  // Player logic - continues without waiting for kavvanah
  useEffect(() => {
    if (!isPlaying || !selectedPrayer || currentWordIndex >= allWords.length) {
      return
    }

    const word = allWords[currentWordIndex]

    // If word has kavvanah, show tooltip
    if (word.kavvanah && word.type !== 'רגיל') {
      const element = document.querySelector(`[data-word-id="${word.id}"]`)
      if (element) {
        const rect = element.getBoundingClientRect()
        setActiveKavvanot(prev => {
          const next = new Map(prev)
          next.set(word.id, {
            word,
            position: { x: rect.left + rect.width / 2, y: rect.top }
          })
          return next
        })
      }
    }

    // Scroll to word
    const element = document.querySelector(`[data-word-id="${word.id}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    // Move to next word (don't wait for kavvanah to disappear)
    const delay = (word.type !== 'רגיל' ? 600 : 300) / playbackSpeed

    playbackRef.current = setTimeout(() => {
      if (currentWordIndex < allWords.length - 1) {
        setCurrentWordIndex(prev => prev + 1)
      } else {
        setIsPlaying(false)
      }
    }, delay)

    return () => {
      if (playbackRef.current) {
        clearTimeout(playbackRef.current)
      }
    }
  }, [isPlaying, currentWordIndex, allWords, playbackSpeed, selectedPrayer])

  // Handlers
  const handleAddCategory = useCallback((name: string) => {
    const newCategory: Category = {
      id: `custom_${Date.now()}`,
      name,
      isBuiltIn: false,
      prayers: []
    }
    const updated = [...categories, newCategory]
    setCategories(updated)
    saveCategories(updated)
    setSelectedCategoryId(newCategory.id)
  }, [categories])

  const handleDeleteCategory = useCallback((id: string) => {
    const updated = categories.filter(c => c.id !== id)
    setCategories(updated)
    saveCategories(updated)
    if (selectedCategoryId === id) {
      setSelectedCategoryId(categories[0]?.id || null)
    }
  }, [categories, selectedCategoryId])

  const handleAddPrayer = useCallback((title: string, text: string) => {
    if (!selectedCategoryId) return

    const prayer = parseSpiritualText(title, text, 'תפארת')
    const updated = categories.map(c => {
      if (c.id === selectedCategoryId) {
        return { ...c, prayers: [...c.prayers, prayer] }
      }
      return c
    })
    setCategories(updated)
    saveCategories(updated)
  }, [categories, selectedCategoryId])

  const handleRemoveKavvanah = useCallback((wordId: string) => {
    setActiveKavvanot(prev => {
      const next = new Map(prev)
      next.delete(wordId)
      return next
    })
  }, [])

  const handleSeek = useCallback((progress: number) => {
    const index = Math.floor(progress * allWords.length)
    setCurrentWordIndex(Math.max(0, Math.min(index, allWords.length - 1)))
  }, [allWords.length])

  const progress = allWords.length > 0 ? currentWordIndex / allWords.length : 0

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#08080f',
      color: '#fff'
    }}>
      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Category sidebar */}
        <CategorySidebar
          categories={categories}
          selectedCategory={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          onAddCategory={() => setShowAddCategory(true)}
          onDeleteCategory={handleDeleteCategory}
        />

        {/* Prayer list */}
        <div style={{
          width: '250px',
          background: '#0b0b14',
          borderLeft: '1px solid #222',
          overflowY: 'auto'
        }}>
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #222',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#888', fontSize: '0.9rem' }}>תפילות</span>
            <button
              onClick={() => setShowAddPrayer(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#4488ff',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: 0
              }}
            >
              +
            </button>
          </div>
          <PrayerList
            prayers={selectedCategory?.prayers || []}
            selectedPrayer={selectedPrayer?.id || null}
            onSelectPrayer={setSelectedPrayer}
            onAddPrayer={() => setShowAddPrayer(true)}
          />
        </div>

        {/* Book view */}
        <BookView
          prayer={selectedPrayer}
          currentWordIndex={currentWordIndex}
          isPlaying={isPlaying}
          activeKavvanot={activeKavvanot}
          onRemoveKavvanah={handleRemoveKavvanah}
        />
      </div>

      {/* Player controls */}
      <PlayerControls
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(prev => !prev)}
        speed={playbackSpeed}
        onSpeedChange={setPlaybackSpeed}
        progress={progress}
        onSeek={handleSeek}
      />

      {/* Modals */}
      <AddCategoryModal
        isOpen={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        onSave={handleAddCategory}
      />
      <AddPrayerModal
        isOpen={showAddPrayer}
        onClose={() => setShowAddPrayer(false)}
        onSave={handleAddPrayer}
      />
    </div>
  )
}
