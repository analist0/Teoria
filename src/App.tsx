/**
 * 🧬 Spiritual Light Engine - Main Application
 *
 * מנוע האור הרוחני - אפליקציית סידור אינטראקטיבית
 */

import { useState, useCallback } from 'react'
import { SpiritualCanvas } from '@/components/SpiritualCanvas'
import { SpiritualTextComponent } from '@/components/SpiritualText'
import { ALL_PRAYERS } from '@/data/prayers'
import type { SpiritualText, Sefirah } from '@/engine/types'
import { SEFIROT_VISUALS } from '@/engine/sefirot'
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
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
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
// MAIN APP
// ═══════════════════════════════════════════════════════════════════

export default function App() {
  const [selectedPrayer, setSelectedPrayer] = useState<SpiritualText>(ALL_PRAYERS[0])
  const [currentSefirah, setCurrentSefirah] = useState<Sefirah | null>(
    selectedPrayer.defaultSefirah || null
  )

  const handlePrayerSelect = useCallback((prayer: SpiritualText) => {
    setSelectedPrayer(prayer)
    setCurrentSefirah(prayer.defaultSefirah || null)
  }, [])

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

      {/* Prayer Text */}
      <SpiritualTextComponent
        text={selectedPrayer}
      />

      {/* Sefirah Indicator */}
      <SefirahIndicator sefirah={currentSefirah} />

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}
