/**
 * 🎛️ Control Panel
 *
 * פאנל בקרה עם נגן תפילה והגדרות
 */

import { useState } from 'react'
import type { Sefirah } from '@/engine/types'
import { SEFIROT_VISUALS } from '@/engine/sefirot'
import { useSpiritualStore } from '@/stores/spiritualStore'

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface ControlPanelProps {
  isPlaying: boolean
  onPlayPause: () => void
  speed: number
  onSpeedChange: (speed: number) => void
  currentWordIndex: number
  totalWords: number
  onSeek: (index: number) => void
  currentSefirah: Sefirah | null
}

// ═══════════════════════════════════════════════════════════════════
// PLAY BUTTON
// ═══════════════════════════════════════════════════════════════════

function PlayButton({ isPlaying, onClick }: { isPlaying: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #4488ff 0%, #6644ff 100%)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(68, 136, 255, 0.4)',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)'
        e.currentTarget.style.boxShadow = '0 6px 30px rgba(68, 136, 255, 0.6)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(68, 136, 255, 0.4)'
      }}
    >
      {isPlaying ? (
        // Pause icon
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        // Play icon
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SPEED CONTROL
// ═══════════════════════════════════════════════════════════════════

function SpeedControl({ speed, onChange }: { speed: number; onChange: (speed: number) => void }) {
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      <span style={{ fontSize: '0.85rem', color: '#888' }}>מהירות:</span>
      <div style={{
        display: 'flex',
        gap: '0.25rem'
      }}>
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem',
              background: speed === s ? 'rgba(68, 136, 255, 0.3)' : 'transparent',
              border: `1px solid ${speed === s ? 'rgba(68, 136, 255, 0.5)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '4px',
              color: speed === s ? '#fff' : '#888',
              cursor: 'pointer'
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
// PROGRESS BAR
// ═══════════════════════════════════════════════════════════════════

function ProgressBar({
  current,
  total,
  onSeek,
  sefirah
}: {
  current: number
  total: number
  onSeek: (index: number) => void
  sefirah: Sefirah | null
}) {
  const progress = total > 0 ? (current / total) * 100 : 0
  const color = sefirah ? SEFIROT_VISUALS[sefirah].primaryColor : '#4488ff'

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width
    const index = Math.floor(percent * total)
    onSeek(index)
  }

  return (
    <div
      onClick={handleClick}
      style={{
        width: '100%',
        height: '8px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
        cursor: 'pointer',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color} 0%, ${color}88 100%)`,
          borderRadius: '4px',
          transition: 'width 0.3s ease',
          boxShadow: `0 0 10px ${color}80`
        }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SETTINGS PANEL
// ═══════════════════════════════════════════════════════════════════

function SettingsPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { config, updateConfig, updatePostProcess } = useSpiritualStore()

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'rgba(15, 15, 25, 0.98)',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '400px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        border: '1px solid rgba(100, 150, 255, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: 0, color: '#fff' }}>הגדרות</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Bloom Settings */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.75rem' }}>אפקט זוהר (Bloom)</h3>

          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', color: '#ccc' }}>
            <input
              type="checkbox"
              checked={config.postProcess.bloom.enabled}
              onChange={(e) => updatePostProcess({
                bloom: { ...config.postProcess.bloom, enabled: e.target.checked }
              })}
              style={{ marginLeft: '0.5rem' }}
            />
            מופעל
          </label>

          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>עוצמה: {config.postProcess.bloom.intensity.toFixed(1)}</span>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.postProcess.bloom.intensity}
              onChange={(e) => updatePostProcess({
                bloom: { ...config.postProcess.bloom, intensity: parseFloat(e.target.value) }
              })}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Vignette Settings */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.75rem' }}>כהות בקצוות (Vignette)</h3>

          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', color: '#ccc' }}>
            <input
              type="checkbox"
              checked={config.postProcess.vignette.enabled}
              onChange={(e) => updatePostProcess({
                vignette: { ...config.postProcess.vignette, enabled: e.target.checked }
              })}
              style={{ marginLeft: '0.5rem' }}
            />
            מופעל
          </label>

          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>כהות: {config.postProcess.vignette.darkness.toFixed(1)}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.postProcess.vignette.darkness}
              onChange={(e) => updatePostProcess({
                vignette: { ...config.postProcess.vignette, darkness: parseFloat(e.target.value) }
              })}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Particles Settings */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.75rem' }}>חלקיקים</h3>

          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>כמות: {config.particles.count}</span>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={config.particles.count}
              onChange={(e) => updateConfig({
                particles: { ...config.particles, count: parseInt(e.target.value) }
              })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>מהירות: {config.particles.speed.toFixed(1)}</span>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={config.particles.speed}
              onChange={(e) => updateConfig({
                particles: { ...config.particles, speed: parseFloat(e.target.value) }
              })}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'linear-gradient(135deg, #4488ff 0%, #6644ff 100%)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          סגור
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN CONTROL PANEL
// ═══════════════════════════════════════════════════════════════════

export function ControlPanel({
  isPlaying,
  onPlayPause,
  speed,
  onSpeedChange,
  currentWordIndex,
  totalWords,
  onSeek,
  currentSefirah
}: ControlPanelProps) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: '5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        background: 'rgba(10, 10, 20, 0.95)',
        borderRadius: '16px',
        padding: '1rem 1.5rem',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(100, 150, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        minWidth: '300px'
      }}>
        {/* Progress */}
        <ProgressBar
          current={currentWordIndex}
          total={totalWords}
          onSeek={onSeek}
          sefirah={currentSefirah}
        />

        {/* Controls Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#888'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
            </svg>
          </button>

          {/* Play Button */}
          <PlayButton isPlaying={isPlaying} onClick={onPlayPause} />

          {/* Word Counter */}
          <div style={{
            minWidth: '60px',
            textAlign: 'center',
            color: '#888',
            fontSize: '0.85rem'
          }}>
            {currentWordIndex + 1} / {totalWords}
          </div>
        </div>

        {/* Speed Control */}
        <SpeedControl speed={speed} onChange={onSpeedChange} />
      </div>

      {/* Settings Modal */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}

export default ControlPanel
