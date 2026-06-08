import type { PresetId } from '../src/types'

export interface Preset {
  id: PresetId
  label: string
  description: string
  jpegQuality: number
  webpQuality: number
  maxSide: number | null
  progressive: boolean
}

export const PRESETS: Preset[] = [
  {
    id: 'maximum',
    label: 'Максимум',
    description: 'Минимальная потеря качества',
    jpegQuality: 92,
    webpQuality: 90,
    maxSide: null,
    progressive: false
  },
  {
    id: 'high',
    label: 'Высокое',
    description: 'Архив / печать',
    jpegQuality: 85,
    webpQuality: 82,
    maxSide: null,
    progressive: false
  },
  {
    id: 'balanced',
    label: 'Сбалансированное',
    description: 'Универсальный вариант',
    jpegQuality: 75,
    webpQuality: 72,
    maxSide: 2560,
    progressive: false
  },
  {
    id: 'web',
    label: 'Веб',
    description: 'Сайты и соцсети',
    jpegQuality: 70,
    webpQuality: 68,
    maxSide: 1920,
    progressive: true
  },
  {
    id: 'aggressive',
    label: 'Агрессивное',
    description: 'Максимальная экономия',
    jpegQuality: 55,
    webpQuality: 52,
    maxSide: 1280,
    progressive: true
  }
]

export function getPreset(id: PresetId): Preset {
  const preset = PRESETS.find((item) => item.id === id)
  if (!preset) {
    throw new Error(`Unknown preset: ${id}`)
  }
  return preset
}
