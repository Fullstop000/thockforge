import { KeycapMaterial, KeycapProfile, SwitchType } from './keyboardConfig'

/**
 * 键帽 Profile 的统一几何预设（单位：米/角度）。
 * 这是键帽外形推导的单一真源，主场景与所有预览视图必须共用。
 */
export interface KeycapProfilePreset {
  /** 1U 键帽高度基准（m）。 */
  top: number
  /** 前后倾角（deg）。 */
  angle: number
  /** 顶面凹碟深度（m）。 */
  dish: number
  /** 外壳圆角半径（m）。 */
  radius: number
  /** 顶面收腰量（m）。 */
  topInset: number
  /** 顶面前后收缩比例偏置。 */
  topDepthBias: number
  /** 顶面整体抬升偏置（m）。 */
  crownLift: number
  /** 额外高度偏置（m）。 */
  heightBias: number
}

/**
 * 材质族 PBR 预设。
 * 所有材质参数必须走此受限区间，避免出现超物理值。
 */
export interface MaterialPbrPreset {
  /** 粗糙度，范围 0~1。 */
  roughness: number
  /** 金属度，范围 0~1。 */
  metalness: number
  /** 清漆层强度，范围 0~1。 */
  clearcoat: number
  /** 表面柔亮感（用于风格微调）。 */
  sheen: number
  /** 颜色偏移，单位为 RGB 通道偏置值。 */
  colorShift: number
}

/**
 * 轴体机械预设。
 * 只描述机械行为，不包含材质与外观细节。
 */
export interface SwitchMechanicalPreset {
  /** 标称总行程（mm）。 */
  travelMm: number
  /** 标称预行程（mm）。 */
  preTravelMm: number
  /** 段落峰位置占总行程比例。 */
  bumpCenterRatio: number
  /** 段落峰宽度占总行程比例。 */
  bumpWidthRatio: number
  /** 段落反馈强度。 */
  bumpStrength: number
}

/**
 * MX 风格轴体结构预设（单位：mm）。
 * 该结构仅描述几何装配语义，不包含动力学参数。
 */
export interface SwitchStructuralPreset {
  /** 下壳宽度。 */
  housingWidthMm: number
  /** 下壳深度。 */
  housingDepthMm: number
  /** 下壳高度。 */
  bottomHousingHeightMm: number
  /** 上盖高度。 */
  topHousingHeightMm: number
  /** Stem 主柱宽度。 */
  stemPoleWidthMm: number
  /** Stem 主柱深度。 */
  stemPoleDepthMm: number
  /** Stem 主柱高度。 */
  stemPoleHeightMm: number
  /** Stem 十字臂长度。 */
  stemCrossArmMm: number
  /** Stem 十字槽宽度。 */
  stemCrossSlotMm: number
  /** Stem 顶帽高度。 */
  stemCapHeightMm: number
  /** 金属簧片高度。 */
  metalLeafHeightMm: number
  /** 触点引脚长度。 */
  pinLengthMm: number
  /** 两针中心间距。 */
  pinSpanMm: number
  /** 轴体与定位板间隙。 */
  mountPlateClearanceMm: number
}

/**
 * 键帽与 stem 卡接预设（单位：mm）。
 * 用于约束键帽腔体挂点与 stem 十字柱的相对尺度。
 */
export interface KeycapMountPreset {
  /** 轴心套筒外宽。 */
  socketOuterWidthMm: number
  /** 轴心套筒外深。 */
  socketOuterDepthMm: number
  /** 套筒深度。 */
  socketDepthMm: number
  /** 套筒十字槽宽。 */
  socketCrossSlotMm: number
  /** 默认卡接深度。 */
  engagementDepthMm: number
  /** stem 与套筒径向间隙。 */
  mountClearanceMm: number
  /** 加强筋厚度。 */
  ribThicknessMm: number
  /** 加强筋高度。 */
  ribHeightMm: number
}

/**
 * 轻量装配基准（单位：m）。
 * 本阶段仅做静态基准与限幅，不包含求解器状态。
 */
export interface AssemblyDatumLite {
  /** 机壳上沿基准面。 */
  caseTopY: number
  /** 机壳内腔底面。 */
  caseInnerFloorY: number
  /** 定位板近似基准面。 */
  plateY: number
  /** 轴体上盖中心高度。 */
  switchTopY: number
  /** 轴体下壳中心高度。 */
  switchBottomY: number
  /** Stem 基准高度。 */
  stemBaseY: number
  /** 键帽静止中心高度。 */
  keycapRestCenterY: number
}

/**
 * 渲染质量档位：用于性能预算与降级策略。
 */
export type RenderQualityTier = 'high' | 'balanced' | 'performance'

/**
 * 几何与性能预算。
 * 指标用于回归门禁，不作为视觉调色参数。
 */
export interface GeometryBudget {
  /** 顶面曲面细分（X 方向）。 */
  keycapTopSegmentsX: number
  /** 顶面曲面细分（Z 方向）。 */
  keycapTopSegmentsZ: number
  /** 主场景允许的最大 Draw Calls。 */
  maxDrawCalls: number
  /** 主场景允许的最大三角面数。 */
  maxTriangles: number
  /** 主场景 CPU 帧预算（ms）。 */
  cpuFrameBudgetMs: number
  /** 主场景 GPU 帧预算（ms）。 */
  gpuFrameBudgetMs: number
}

/**
 * 键帽 Profile 几何真源。
 */
export const KEYCAP_PROFILE_PRESETS: Record<KeycapProfile, KeycapProfilePreset> = {
  cherry: {
    top: 0.0115,
    angle: 8,
    dish: 0.00085,
    radius: 0.0011,
    topInset: 0.0019,
    topDepthBias: 1.02,
    crownLift: 0.0011,
    heightBias: 0.0001,
  },
  sa: {
    top: 0.0175,
    angle: 13,
    dish: 0.00115,
    radius: 0.0015,
    topInset: 0.0032,
    topDepthBias: 1.16,
    crownLift: 0.0018,
    heightBias: 0.0009,
  },
  oem: {
    top: 0.0138,
    angle: 9,
    dish: 0.00095,
    radius: 0.00115,
    topInset: 0.00225,
    topDepthBias: 1.08,
    crownLift: 0.0013,
    heightBias: 0.00035,
  },
  xda: {
    top: 0.0084,
    angle: 2,
    dish: 0.00042,
    radius: 0.00095,
    topInset: 0.0009,
    topDepthBias: 0.96,
    crownLift: 0.00055,
    heightBias: -0.00045,
  },
  dsa: {
    top: 0.0074,
    angle: 0,
    dish: 0.00035,
    radius: 0.0009,
    topInset: 0.0007,
    topDepthBias: 0.95,
    crownLift: 0.00045,
    heightBias: -0.00055,
  },
  mt3: {
    top: 0.0162,
    angle: 12,
    dish: 0.0012,
    radius: 0.00145,
    topInset: 0.003,
    topDepthBias: 1.2,
    crownLift: 0.00195,
    heightBias: 0.00075,
  },
  kat: {
    top: 0.0108,
    angle: 6,
    dish: 0.00072,
    radius: 0.00105,
    topInset: 0.00145,
    topDepthBias: 1.02,
    crownLift: 0.0009,
    heightBias: -0.00005,
  },
}

/**
 * 材质 PBR 真源。
 */
export const MATERIAL_PBR_PRESETS: Record<KeycapMaterial, MaterialPbrPreset> = {
  pbt: { roughness: 0.78, metalness: 0.02, clearcoat: 0.08, sheen: 0.06, colorShift: 0 },
  abs: { roughness: 0.44, metalness: 0.06, clearcoat: 0.34, sheen: 0.24, colorShift: 8 },
  pc: { roughness: 0.2, metalness: 0.04, clearcoat: 0.62, sheen: 0.18, colorShift: 16 },
  pom: { roughness: 0.58, metalness: 0.03, clearcoat: 0.18, sheen: 0.12, colorShift: 2 },
  pbt_double: { roughness: 0.62, metalness: 0.02, clearcoat: 0.12, sheen: 0.1, colorShift: 4 },
  resin: { roughness: 0.3, metalness: 0.12, clearcoat: 0.52, sheen: 0.34, colorShift: 12 },
  ceramic: { roughness: 0.2, metalness: 0.14, clearcoat: 0.72, sheen: 0.44, colorShift: 14 },
  metal_alu: { roughness: 0.28, metalness: 0.74, clearcoat: 0.24, sheen: 0.36, colorShift: -8 },
  metal_brass: { roughness: 0.22, metalness: 0.8, clearcoat: 0.2, sheen: 0.38, colorShift: 14 },
}

/**
 * 轴体机械行为真源。
 */
export const SWITCH_MECHANICAL_PRESETS: Record<SwitchType, SwitchMechanicalPreset> = {
  linear: {
    travelMm: 4,
    preTravelMm: 2,
    bumpCenterRatio: 0.5,
    bumpWidthRatio: 0.1,
    bumpStrength: 0,
  },
  tactile: {
    travelMm: 3.8,
    preTravelMm: 1.9,
    bumpCenterRatio: 0.43,
    bumpWidthRatio: 0.16,
    bumpStrength: 0.55,
  },
  clicky: {
    travelMm: 3.6,
    preTravelMm: 1.8,
    bumpCenterRatio: 0.43,
    bumpWidthRatio: 0.16,
    bumpStrength: 0.9,
  },
  silent: {
    travelMm: 3.3,
    preTravelMm: 1.6,
    bumpCenterRatio: 0.5,
    bumpWidthRatio: 0.1,
    bumpStrength: 0,
  },
}

/**
 * MX 风格轴体结构真源。
 * 注：本阶段只做结构级可解释建模，不追求制造公差级复刻。
 */
export const SWITCH_STRUCTURAL_PRESETS: Record<SwitchType, SwitchStructuralPreset> = {
  linear: {
    housingWidthMm: 14,
    housingDepthMm: 14,
    bottomHousingHeightMm: 6.2,
    topHousingHeightMm: 3.3,
    stemPoleWidthMm: 4.0,
    stemPoleDepthMm: 4.0,
    stemPoleHeightMm: 3.2,
    stemCrossArmMm: 3.9,
    stemCrossSlotMm: 1.2,
    stemCapHeightMm: 1.2,
    metalLeafHeightMm: 3.9,
    pinLengthMm: 3.2,
    pinSpanMm: 5.0,
    mountPlateClearanceMm: 0.2,
  },
  tactile: {
    housingWidthMm: 14,
    housingDepthMm: 14,
    bottomHousingHeightMm: 6.2,
    topHousingHeightMm: 3.3,
    stemPoleWidthMm: 4.0,
    stemPoleDepthMm: 4.0,
    stemPoleHeightMm: 3.2,
    stemCrossArmMm: 3.9,
    stemCrossSlotMm: 1.2,
    stemCapHeightMm: 1.2,
    metalLeafHeightMm: 4.1,
    pinLengthMm: 3.2,
    pinSpanMm: 5.0,
    mountPlateClearanceMm: 0.2,
  },
  clicky: {
    housingWidthMm: 14,
    housingDepthMm: 14,
    bottomHousingHeightMm: 6.2,
    topHousingHeightMm: 3.3,
    stemPoleWidthMm: 4.0,
    stemPoleDepthMm: 4.0,
    stemPoleHeightMm: 3.2,
    stemCrossArmMm: 3.9,
    stemCrossSlotMm: 1.2,
    stemCapHeightMm: 1.2,
    metalLeafHeightMm: 4.4,
    pinLengthMm: 3.2,
    pinSpanMm: 5.0,
    mountPlateClearanceMm: 0.2,
  },
  silent: {
    housingWidthMm: 14,
    housingDepthMm: 14,
    bottomHousingHeightMm: 6.2,
    topHousingHeightMm: 3.3,
    stemPoleWidthMm: 4.0,
    stemPoleDepthMm: 4.0,
    stemPoleHeightMm: 3.2,
    stemCrossArmMm: 3.9,
    stemCrossSlotMm: 1.2,
    stemCapHeightMm: 1.2,
    metalLeafHeightMm: 3.8,
    pinLengthMm: 3.2,
    pinSpanMm: 5.0,
    mountPlateClearanceMm: 0.2,
  },
}

/**
 * MX 轴心键帽挂点默认预设。
 */
export const KEYCAP_MOUNT_PRESET_MX: KeycapMountPreset = {
  socketOuterWidthMm: 5.7,
  socketOuterDepthMm: 5.7,
  socketDepthMm: 4.6,
  socketCrossSlotMm: 1.26,
  engagementDepthMm: 3.6,
  mountClearanceMm: 0.09,
  ribThicknessMm: 0.88,
  ribHeightMm: 2.6,
}

/**
 * 键帽主题基色表。
 */
export const KEYCAP_THEME_COLORS: Record<string, string> = {
  default: '#f3f4f7',
  carbon: '#323743',
  pastel: '#ffeef6',
  cyberpunk: '#2b3348',
  ocean: '#eaf7ff',
}

/**
 * 配色偏移表。
 */
export const KEYCAP_COLORWAY_SHIFT: Record<string, number> = {
  classic: 0,
  mod: -18,
  fn: 8,
  nav: 6,
  numpad: -4,
  cyber: 12,
  retro: -10,
}

/**
 * 主题 + tone 的基础色盘。
 */
export const KEYCAP_TONE_COLORS: Record<string, Record<'default' | 'modifier' | 'accent' | 'dark', string>> = {
  default: {
    default: '#f3f4f7',
    modifier: '#d9dde6',
    accent: '#87dcff',
    dark: '#1f232d',
  },
  carbon: {
    default: '#323743',
    modifier: '#4b5161',
    accent: '#76dcff',
    dark: '#151922',
  },
  pastel: {
    default: '#ffeef6',
    modifier: '#f7dbe9',
    accent: '#ffc9e6',
    dark: '#4c3651',
  },
  cyberpunk: {
    default: '#2b3348',
    modifier: '#1b2133',
    accent: '#4ad7ff',
    dark: '#0d1120',
  },
  ocean: {
    default: '#eaf7ff',
    modifier: '#cfe8f5',
    accent: '#73d5ff',
    dark: '#1f3141',
  },
}

/**
 * 轴体类型视觉强调色。
 */
export const SWITCH_TYPE_ACCENT_COLORS: Record<SwitchType, string> = {
  linear: '#62f2cc',
  tactile: '#75b9ff',
  clicky: '#ffcf54',
  silent: '#a9b0b8',
}

/**
 * 质量档位预算（以 60% 配列中景视角为基准）。
 */
export const RENDER_GEOMETRY_BUDGETS: Record<RenderQualityTier, GeometryBudget> = {
  high: {
    keycapTopSegmentsX: 26,
    keycapTopSegmentsZ: 18,
    maxDrawCalls: 450,
    maxTriangles: 560000,
    cpuFrameBudgetMs: 6,
    gpuFrameBudgetMs: 8,
  },
  balanced: {
    keycapTopSegmentsX: 20,
    keycapTopSegmentsZ: 14,
    maxDrawCalls: 320,
    maxTriangles: 360000,
    cpuFrameBudgetMs: 5,
    gpuFrameBudgetMs: 6.5,
  },
  performance: {
    keycapTopSegmentsX: 14,
    keycapTopSegmentsZ: 10,
    maxDrawCalls: 220,
    maxTriangles: 220000,
    cpuFrameBudgetMs: 4,
    gpuFrameBudgetMs: 5.5,
  },
}

/**
 * 默认质量档位。
 */
export const DEFAULT_RENDER_QUALITY: RenderQualityTier = 'balanced'
