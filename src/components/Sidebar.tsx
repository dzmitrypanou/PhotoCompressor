import { PRESETS } from '../../shared/presets'
import type { PresetId } from '../types'

interface SidebarProps {
  selectedPreset: PresetId
  onSelectPreset: (preset: PresetId) => void
}

export function Sidebar({ selectedPreset, onSelectPreset }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-icon">PC</span>
        <span>Photo Compressor</span>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">ПРЕСЕТЫ</div>
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`preset-item ${selectedPreset === preset.id ? 'active' : ''}`}
            onClick={() => onSelectPreset(preset.id)}
          >
            <span className="preset-dot" />
            <span className="preset-text">
              <span className="preset-label">{preset.label}</span>
              <span className="preset-description">{preset.description}</span>
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}
