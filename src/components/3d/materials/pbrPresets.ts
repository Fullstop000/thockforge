import { HousingMaterial, SwitchType, StemMaterial } from '@/types/keyboard'
import {
  KEYCAP_COLORWAY_SHIFT,
  KEYCAP_THEME_COLORS,
  KEYCAP_TONE_COLORS,
  MaterialPbrPreset,
  SWITCH_TYPE_ACCENT_COLORS,
} from '@/types/renderingModel'

/**
 * 常用数值夹取工具，避免超出物理参数区间。
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * 颜色通道偏移：用于材质与配色细节变化。
 */
export function shiftColor(hex: string, shift: number): string {
  const raw = hex.replace('#', '')
  if (raw.length !== 6) {
    return hex
  }

  const r = clamp(parseInt(raw.slice(0, 2), 16) + shift, 0, 255)
  const g = clamp(parseInt(raw.slice(2, 4), 16) + shift, 0, 255)
  const b = clamp(parseInt(raw.slice(4, 6), 16) + shift, 0, 255)

  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g)
    .toString(16)
    .padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`
}

/**
 * 计算颜色亮度，用于自动选择字符明暗色。
 */
export function colorBrightness(hex: string): number {
  const raw = hex.replace('#', '')
  if (raw.length !== 6) {
    return 128
  }

  const r = parseInt(raw.slice(0, 2), 16)
  const g = parseInt(raw.slice(2, 4), 16)
  const b = parseInt(raw.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000
}

/**
 * 从主题 + tone 推导基础颜色。
 */
export function resolveToneBaseColor(theme: string, tone: 'default' | 'modifier' | 'accent' | 'dark'): string {
  const palette = KEYCAP_TONE_COLORS[theme] || KEYCAP_TONE_COLORS.default
  return palette[tone] || palette.default
}

/**
 * 主题色再叠加 colorway 偏移后的结果。
 */
export function resolveThemeColor(theme: string, colorway: string): string {
  const base = KEYCAP_THEME_COLORS[theme] || KEYCAP_THEME_COLORS.default
  const shift = KEYCAP_COLORWAY_SHIFT[colorway] ?? 0
  return shiftColor(base, shift)
}

/**
 * 基于材质预设 + 旧化程度推导顶面材质。
 */
export function resolveTopSurfacePbr(materialPreset: MaterialPbrPreset, wearRatio: number) {
  const dynamicTopRoughness = clamp(materialPreset.roughness * (1 - wearRatio * 0.58), 0.06, 1)
  const dynamicTopClearcoat = clamp(materialPreset.clearcoat + wearRatio * 0.25, 0, 1)
  return {
    roughness: dynamicTopRoughness,
    metalness: materialPreset.metalness,
    clearcoat: dynamicTopClearcoat,
    clearcoatRoughness: 0.22 + wearRatio * 0.2,
  }
}

/**
 * 侧壁材质参数。
 */
export function resolveSideSurfacePbr(materialPreset: MaterialPbrPreset, wearRatio: number) {
  const top = resolveTopSurfacePbr(materialPreset, wearRatio)
  return {
    roughness: Math.min(1, top.roughness + 0.1),
    metalness: materialPreset.metalness,
    clearcoat: Math.max(0.04, top.clearcoat * 0.38),
    clearcoatRoughness: 0.45,
  }
}

/**
 * 顶面凹碟材质参数。
 */
export function resolveDishSurfacePbr(materialPreset: MaterialPbrPreset, wearRatio: number) {
  const top = resolveTopSurfacePbr(materialPreset, wearRatio)
  return {
    roughness: Math.min(1, top.roughness + 0.08),
    metalness: Math.max(0, materialPreset.metalness - 0.02),
    clearcoat: Math.max(0.02, top.clearcoat * 0.2),
    clearcoatRoughness: 0.5,
  }
}

/**
 * 轴体上盖材质颜色。
 */
export const SWITCH_HOUSING_COLORS: Record<HousingMaterial, string> = {
  nylon: '#b9b7af',
  pc: '#b8d8f4',
  pom: '#f0f0f0',
  upe: '#d8f2e0',
}

/**
 * 轴心材质颜色。
 */
export const STEM_COLORS: Record<StemMaterial, string> = {
  pom: '#f5ce4f',
  ly: '#d4f25f',
  upe: '#98f2c8',
  pe: '#f6a2b8',
}

/**
 * 轴体类型强调色。
 */
export const SWITCH_TYPE_ACCENTS: Record<SwitchType, string> = SWITCH_TYPE_ACCENT_COLORS
