/**
 * 📝 Prayer Editor Component
 *
 * עורך תפילות מותאם אישית - הוספה ועריכת כוונות
 */

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { parseSpiritualText } from '@/engine/textEngine'
import type { SpiritualText, Sefirah, SpiritualWord } from '@/engine/types'
import { SEFIROT_VISUALS } from '@/engine/sefirot'

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface CustomKavvanah {
  wordText: string
  kavvanah: string
  sefirah?: Sefirah
}

interface CustomPrayer {
  id: string
  title: string
  text: string
  kavvanot: CustomKavvanah[]
  createdAt: number
}

// ═══════════════════════════════════════════════════════════════════
// LOCAL STORAGE
// ═══════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'spiritual_custom_prayers'
const KAVVANOT_STORAGE_KEY = 'spiritual_custom_kavvanot'

function loadCustomPrayers(): CustomPrayer[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveCustomPrayers(prayers: CustomPrayer[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prayers))
}

function loadCustomKavvanot(): Record<string, CustomKavvanah> {
  try {
    const data = localStorage.getItem(KAVVANOT_STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

function saveCustomKavvanot(kavvanot: Record<string, CustomKavvanah>): void {
  localStorage.setItem(KAVVANOT_STORAGE_KEY, JSON.stringify(kavvanot))
}

// ═══════════════════════════════════════════════════════════════════
// ADD PRAYER MODAL
// ═══════════════════════════════════════════════════════════════════

interface AddPrayerModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (prayer: CustomPrayer) => void
}

function AddPrayerModal({ isOpen, onClose, onSave }: AddPrayerModalProps) {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [sefirah, setSefirah] = useState<Sefirah>('תפארת')

  const handleSave = () => {
    if (!title.trim() || !text.trim()) return

    const prayer: CustomPrayer = {
      id: `custom_${Date.now()}`,
      title: title.trim(),
      text: text.trim(),
      kavvanot: [],
      createdAt: Date.now()
    }

    onSave(prayer)
    setTitle('')
    setText('')
    onClose()
  }

  if (!isOpen) return null

  const sefirot: Sefirah[] = ['כתר', 'חכמה', 'בינה', 'חסד', 'גבורה', 'תפארת', 'נצח', 'הוד', 'יסוד', 'מלכות']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        style={{
          background: 'rgba(10, 10, 20, 0.98)',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          border: '1px solid rgba(100, 150, 255, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: '#fff', marginBottom: '1.5rem', textAlign: 'center' }}>
          הוסף תפילה חדשה
        </h2>

        {/* Title Input */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            כותרת התפילה
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="לדוגמה: תפילת הדרך"
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '1rem',
              direction: 'rtl'
            }}
          />
        </div>

        {/* Sefirah Select */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            ספירה ראשית
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {sefirot.map((s) => (
              <button
                key={s}
                onClick={() => setSefirah(s)}
                style={{
                  padding: '0.5rem 1rem',
                  background: sefirah === s ? SEFIROT_VISUALS[s].primaryColor + '40' : 'transparent',
                  border: `1px solid ${sefirah === s ? SEFIROT_VISUALS[s].primaryColor : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: '20px',
                  color: sefirah === s ? SEFIROT_VISUALS[s].primaryColor : '#888',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            טקסט התפילה (שורה חדשה = פסוק חדש)
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="הכנס את הטקסט כאן..."
            rows={8}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '1.1rem',
              lineHeight: 1.8,
              resize: 'vertical',
              direction: 'rtl',
              fontFamily: "'Frank Ruhl Libre', serif"
            }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 2rem',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              color: '#888',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            ביטול
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !text.trim()}
            style={{
              padding: '0.75rem 2rem',
              background: title.trim() && text.trim()
                ? 'linear-gradient(135deg, #4488ff 0%, #6644ff 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: title.trim() && text.trim() ? 'pointer' : 'not-allowed',
              fontSize: '1rem'
            }}
          >
            שמור תפילה
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// KAVVANAH EDITOR MODAL
// ═══════════════════════════════════════════════════════════════════

interface KavvanahEditorProps {
  word: SpiritualWord | null
  onClose: () => void
  onSave: (wordText: string, kavvanah: string, sefirah?: Sefirah) => void
}

function KavvanahEditor({ word, onClose, onSave }: KavvanahEditorProps) {
  const [kavvanah, setKavvanah] = useState(word?.kavvanah || '')
  const [sefirah, setSefirah] = useState<Sefirah | undefined>(word?.sefirah)

  useEffect(() => {
    if (word) {
      setKavvanah(word.kavvanah || '')
      setSefirah(word.sefirah)
    }
  }, [word])

  if (!word) return null

  const sefirot: Sefirah[] = ['כתר', 'חכמה', 'בינה', 'חסד', 'גבורה', 'תפארת', 'נצח', 'הוד', 'יסוד', 'מלכות']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        style={{
          background: 'rgba(10, 10, 20, 0.98)',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '450px',
          width: '100%',
          border: '1px solid rgba(100, 150, 255, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ color: '#fff', marginBottom: '1rem', textAlign: 'center' }}>
          ערוך כוונה
        </h3>

        {/* Word Display */}
        <div style={{
          textAlign: 'center',
          fontSize: '2rem',
          color: sefirah ? SEFIROT_VISUALS[sefirah].primaryColor : '#4488ff',
          marginBottom: '1.5rem',
          fontFamily: "'Frank Ruhl Libre', serif",
          textShadow: sefirah ? `0 0 20px ${SEFIROT_VISUALS[sefirah].primaryColor}80` : '0 0 20px #4488ff80'
        }}>
          {word.text}
        </div>

        {/* Sefirah Select */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            ספירה
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {sefirot.map((s) => (
              <button
                key={s}
                onClick={() => setSefirah(s)}
                style={{
                  padding: '0.4rem 0.8rem',
                  background: sefirah === s ? SEFIROT_VISUALS[s].primaryColor + '40' : 'transparent',
                  border: `1px solid ${sefirah === s ? SEFIROT_VISUALS[s].primaryColor : 'rgba(255,255,255,0.15)'}`,
                  borderRadius: '16px',
                  color: sefirah === s ? SEFIROT_VISUALS[s].primaryColor : '#666',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Kavvanah Input */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            כוונה
          </label>
          <textarea
            value={kavvanah}
            onChange={(e) => setKavvanah(e.target.value)}
            placeholder="הכנס את הכוונה למילה זו..."
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '1rem',
              lineHeight: 1.6,
              resize: 'vertical',
              direction: 'rtl'
            }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.6rem 1.5rem',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              color: '#888',
              cursor: 'pointer'
            }}
          >
            ביטול
          </button>
          <button
            onClick={() => {
              onSave(word.text, kavvanah, sefirah)
              onClose()
            }}
            style={{
              padding: '0.6rem 1.5rem',
              background: 'linear-gradient(135deg, #4488ff 0%, #6644ff 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            שמור
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ADD BUTTON
// ═══════════════════════════════════════════════════════════════════

interface AddButtonProps {
  onClick: () => void
}

export function AddPrayerButton({ onClick }: AddButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: 'fixed',
        bottom: '10rem',
        right: '2rem',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #4488ff 0%, #6644ff 100%)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(68, 136, 255, 0.4)',
        zIndex: 100
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
      </svg>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════
// EDIT MODE TOGGLE
// ═══════════════════════════════════════════════════════════════════

interface EditModeToggleProps {
  isActive: boolean
  onToggle: () => void
}

export function EditModeToggle({ isActive, onToggle }: EditModeToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: 'fixed',
        bottom: '10rem',
        left: '2rem',
        padding: '0.75rem 1.25rem',
        borderRadius: '24px',
        background: isActive
          ? 'linear-gradient(135deg, #ff8844 0%, #ff4488 100%)'
          : 'rgba(255, 255, 255, 0.1)',
        border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: isActive ? '#fff' : '#888',
        fontSize: '0.9rem',
        zIndex: 100
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
      </svg>
      {isActive ? 'סיום עריכה' : 'מצב עריכה'}
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PRAYER EDITOR HOOK
// ═══════════════════════════════════════════════════════════════════

export function usePrayerEditor() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedWord, setSelectedWord] = useState<SpiritualWord | null>(null)
  const [customPrayers, setCustomPrayers] = useState<CustomPrayer[]>([])
  const [customKavvanot, setCustomKavvanot] = useState<Record<string, CustomKavvanah>>({})

  // Load from storage on mount
  useEffect(() => {
    setCustomPrayers(loadCustomPrayers())
    setCustomKavvanot(loadCustomKavvanot())
  }, [])

  const addPrayer = useCallback((prayer: CustomPrayer) => {
    const updated = [...customPrayers, prayer]
    setCustomPrayers(updated)
    saveCustomPrayers(updated)
  }, [customPrayers])

  const saveKavvanah = useCallback((wordText: string, kavvanah: string, sefirah?: Sefirah) => {
    const updated = {
      ...customKavvanot,
      [wordText]: { wordText, kavvanah, sefirah }
    }
    setCustomKavvanot(updated)
    saveCustomKavvanot(updated)
  }, [customKavvanot])

  const getParsedCustomPrayers = useCallback((): SpiritualText[] => {
    return customPrayers.map(p => parseSpiritualText(p.title, p.text, 'תפארת'))
  }, [customPrayers])

  const getKavvanahForWord = useCallback((wordText: string): CustomKavvanah | undefined => {
    return customKavvanot[wordText]
  }, [customKavvanot])

  return {
    showAddModal,
    setShowAddModal,
    editMode,
    setEditMode,
    selectedWord,
    setSelectedWord,
    customPrayers,
    addPrayer,
    saveKavvanah,
    getParsedCustomPrayers,
    getKavvanahForWord
  }
}

// ═══════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════

export { AddPrayerModal, KavvanahEditor }
export type { CustomPrayer, CustomKavvanah }
