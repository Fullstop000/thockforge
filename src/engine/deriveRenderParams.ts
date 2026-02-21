import {
  InternalsConfig,
  KeycapConfig,
  KeycapZone,
  KeycapZoneConfig,
  SwitchConfig,
} from '@/types/keyboard'
import {
  AssemblyDatumLite,
  DEFAULT_RENDER_QUALITY,
  KEYCAP_MOUNT_PRESET_MX,
  KEYCAP_PROFILE_PRESETS,
  KeycapMountPreset,
  MATERIAL_PBR_PRESETS,
  RenderQualityTier,
  SWITCH_STRUCTURAL_PRESETS,
  SwitchMechanicalPreset,
  SwitchStructuralPreset,
  SWITCH_MECHANICAL_PRESETS,
} from '@/types/renderingModel'
import {
  clamp,
  colorBrightness,
  resolveThemeColor,
  resolveToneBaseColor,
  shiftColor,
  STEM_COLORS,
  SWITCH_HOUSING_COLORS,
  SWITCH_TYPE_ACCENTS,
} from '@/components/3d/materials/pbrPresets'

const UNIT_SIZE = 0.01905
const GAP = 0.001
const CASE_HEIGHT = 0.035
const CASE_BOTTOM_THICKNESS = 0.0044
const CASE_TOP_LIP_THICKNESS = 0.0018

/**
 * 渲染推导支持的 tone。
 */
export type RenderTone = 'default' | 'modifier' | 'accent' | 'dark'

/**
 * 键帽几何简图参数。
 */
export interface ProfileBlueprintGeometry {
  /** 近似高度（mm）。 */
  heightMm: number
  /** 近似凹碟深度（mm）。 */
  dishMm: number
  /** 顶面宽度缩放（0~1）。 */
  topWidthScale: number
  /** 前后倾角（deg）。 */
  frontSlopeDeg: number
}

/**
 * 键帽渲染推导结果。
 */
export interface DerivedKeycapRenderParams {
  /** 生效后的分区配置（含 override 合并）。 */
  zoneConfig: KeycapZoneConfig
  /** Profile 几何预设。 */
  profilePreset: (typeof KEYCAP_PROFILE_PRESETS)[KeycapZoneConfig['profile']]
  /** 材质 PBR 预设。 */
  materialPreset: (typeof MATERIAL_PBR_PRESETS)[KeycapZoneConfig['material']]
  /** 键帽宽度（m）。 */
  keyWidth: number
  /** 键帽深度（m）。 */
  keyDepth: number
  /** 键帽高度（m）。 */
  keyHeight: number
  /** Profile 角度（rad）。 */
  profileAngle: number
  /** 顶面收腰（m）。 */
  topInset: number
  /** 顶面前后收缩（m）。 */
  topDepthInset: number
  /** 顶面宽度（m）。 */
  topPlateWidth: number
  /** 顶面深度（m）。 */
  topPlateDepth: number
  /** 顶面厚度（m）。 */
  topPlateHeight: number
  /** 顶面基准高度（m）。 */
  topPlateY: number
  /** 顶面凹碟深度（m）。 */
  topDishDepth: number
  /** 顶面曲面中心高度（m）。 */
  topSurfaceY: number
  /** 腔体宽度（m）。 */
  cavityWidth: number
  /** 腔体深度（m）。 */
  cavityDepth: number
  /** 腔体高度（m）。 */
  cavityHeight: number
  /** 外壳圆角（m）。 */
  shellRadius: number
  /** 接缝可见度。 */
  seamOpacity: number
  /** CNC 高光可见度。 */
  topHighlightOpacity: number
  /** 行雕归一化偏置。 */
  rowSculptNormalized: number
  /** 顶面/侧面/字符等颜色集合。 */
  colors: {
    baseColor: string
    topColor: string
    sideColor: string
    dishColor: string
    textColor: string
    legendColor: string
    stemAccent: string
  }
  /** 旧化比例（0~1）。 */
  wearRatio: number
  /** 主字符透明度。 */
  legendPrimaryOpacity: number
  /** 副字符透明度。 */
  legendSubOpacity: number
}

/**
 * 轴体渲染推导结果。
 */
export interface DerivedSwitchRenderParams {
  /** 机械预设真源。 */
  mechanicalPreset: SwitchMechanicalPreset
  /** 总行程（m）。 */
  baseTravel: number
  /** 预行程（mm）。 */
  preTravelMm: number
  /** 弹簧刚度。 */
  springStiffness: number
  /** 弹簧阻尼。 */
  springDamping: number
  /** 段落峰中心位置（m）。 */
  bumpCenter: number
  /** 段落峰宽度（m）。 */
  bumpWidth: number
  /** 段落峰强度。 */
  bumpStrength: number
  /** 大键横向抖动幅度（m）。 */
  stabilizerAmplitude: number
  /** 弹簧自由长（mm）。 */
  springFreeLengthMm: number
  /** 弹簧压缩长（mm）。 */
  springCompressedLengthMm: number
  /** 弹簧圈数。 */
  springCoils: number
  /** 弹簧线径（mm）。 */
  springWireDiaMm: number
  /** 弹簧外径（mm）。 */
  springOuterDiaMm: number
  /** O-Ring 有效厚度（mm）。 */
  oringMm: number
  /** 轴间膜厚度（mm）。 */
  filmThicknessMm: number
  /** 轴体结构宽度（m）。 */
  switchFootprint: number
  /** 上盖中心高度（m）。 */
  switchTopY: number
  /** 下壳中心高度（m）。 */
  switchBottomY: number
  /** 轴心基准高度（m）。 */
  stemBaseY: number
  /** 上盖颜色。 */
  switchTopColor: string
  /** 下壳颜色。 */
  switchBottomColor: string
  /** 轴心颜色。 */
  switchStemColor: string
  /** 上盖是否透明。 */
  switchTopIsTransparent: boolean
}

/**
 * 按键动画推导结果。
 */
export interface DerivedAnimationParams {
  /** 按下初段预加载比例。 */
  preloadStageRatio: number
  /** 预加载生效时长（秒）。 */
  preloadStageDuration: number
  /** 行雕曲率偏置。 */
  rowCurveBias: number
  /** 倾角与按压耦合系数。 */
  pressTiltFactor: number
  /** 横向抖动放大系数。 */
  jitterTiltFactor: number
  /** Flex 联动位移（m）。 */
  flexDrop: number
  /** 静止阈值（行程）。 */
  travelEpsilon: number
  /** 静止阈值（速度）。 */
  velocityEpsilon: number
}

/**
 * 轴体结构推导结果（单位：m）。
 * 提供可拆装语义所需的静态结构尺寸。
 */
export interface DerivedSwitchStructureParams {
  /** 结构真源预设。 */
  preset: SwitchStructuralPreset
  /** 下壳宽度。 */
  housingWidth: number
  /** 下壳深度。 */
  housingDepth: number
  /** 下壳高度。 */
  bottomHousingHeight: number
  /** 上盖高度。 */
  topHousingHeight: number
  /** stem 主柱宽度。 */
  stemPoleWidth: number
  /** stem 主柱深度。 */
  stemPoleDepth: number
  /** stem 主柱高度。 */
  stemPoleHeight: number
  /** stem 十字臂长度。 */
  stemCrossArm: number
  /** stem 十字槽宽度。 */
  stemCrossSlot: number
  /** stem 顶帽高度。 */
  stemCapHeight: number
  /** 金属簧片高度。 */
  metalLeafHeight: number
  /** 触点引脚长度。 */
  pinLength: number
  /** 引脚中心距。 */
  pinSpan: number
  /** 与定位板间隙。 */
  mountPlateClearance: number
}

/**
 * 键帽挂点推导结果（单位：m）。
 * 描述 socket 与 stem 的卡接关系和可用侧向余量。
 */
export interface DerivedKeycapMountParams {
  /** 挂点真源预设。 */
  preset: KeycapMountPreset
  /** 套筒外宽。 */
  socketOuterWidth: number
  /** 套筒外深。 */
  socketOuterDepth: number
  /** 套筒深度。 */
  socketDepth: number
  /** 套筒十字槽宽。 */
  socketCrossSlot: number
  /** 卡接深度。 */
  engagementDepth: number
  /** 径向间隙。 */
  mountClearance: number
  /** 加强筋厚度。 */
  ribThickness: number
  /** 加强筋高度。 */
  ribHeight: number
  /** 套筒中心（相对键帽中心）。 */
  socketCenterY: number
  /** 加强筋中心（相对键帽中心）。 */
  ribCenterY: number
  /** 侧向抖动最大限幅（m）。 */
  lateralJitterLimit: number
  /** stem 跟随键帽抖动比例。 */
  stemFollowerJitterRatio: number
}

/**
 * 同一 keyId 是否命中 WASD 热区。
 */
function isWasdKey(id: string): boolean {
  return id === 'w' || id === 'a' || id === 's' || id === 'd'
}

/**
 * 合并分区配置与单键覆盖配置。
 */
export function resolveKeycapZoneConfig(config: KeycapConfig, zone: KeycapZone, keyId: string): KeycapZoneConfig {
  const base = config.zones[zone] || config.zones.alpha
  const override = config.overrides[keyId]
  if (!override) {
    return base
  }

  return {
    ...base,
    ...override,
    thickness: {
      ...base.thickness,
      ...(override.thickness || {}),
    },
  }
}

/**
 * 依据 Profile 真源推导简图几何。
 * 三视图、文档剖面和 UI 标注统一使用该函数。
 */
export function resolveProfileBlueprintGeometry(zoneConfig: KeycapZoneConfig): ProfileBlueprintGeometry {
  const preset = KEYCAP_PROFILE_PRESETS[zoneConfig.profile] || KEYCAP_PROFILE_PRESETS.cherry
  const topScale = zoneConfig.thickness.topMm / 1.5
  const heightMm = clamp((preset.top * topScale + preset.heightBias) * 1000, 6.8, 19.8)
  const dishMm = clamp(preset.dish * (0.92 + zoneConfig.thickness.topMm * 0.2) * 1000, 0.24, 1.45)
  const topWidthScale = clamp(1 - preset.topInset * 36, 0.68, 0.9)

  return {
    heightMm,
    dishMm,
    topWidthScale,
    frontSlopeDeg: preset.angle,
  }
}

/**
 * 纯键帽分区推导入口：用于三视图与转台等不依赖 store 的场景。
 */
export function deriveKeycapRenderParamsFromZone(options: {
  zoneConfig: KeycapZoneConfig
  keyId: string
  row: number
  width: number
  depth: number
  tone?: RenderTone
}): DerivedKeycapRenderParams {
  const { zoneConfig, keyId, row, width, depth, tone = 'default' } = options
  const profilePreset = KEYCAP_PROFILE_PRESETS[zoneConfig.profile] || KEYCAP_PROFILE_PRESETS.cherry
  const materialPreset = MATERIAL_PBR_PRESETS[zoneConfig.material] || MATERIAL_PBR_PRESETS.pbt

  const keyWidth = width * UNIT_SIZE - GAP
  const keyDepth = depth * UNIT_SIZE - GAP
  const profileHeightScale = zoneConfig.thickness.topMm / 1.5
  const keyHeight = clamp(profilePreset.top * profileHeightScale + profilePreset.heightBias, 0.0068, 0.0198)
  const profileAngle = (profilePreset.angle * Math.PI) / 180

  const topInset = clamp(profilePreset.topInset + (zoneConfig.thickness.sideMm - 1.3) * 0.00028, 0.00045, 0.0038)
  const topDepthInset = clamp(topInset * profilePreset.topDepthBias, 0.00045, 0.0042)
  const topPlateWidth = clamp(keyWidth - topInset, keyWidth * 0.54, keyWidth - 0.0006)
  const topPlateDepth = clamp(keyDepth - topDepthInset, keyDepth * 0.54, keyDepth - 0.0006)
  // 顶板厚度需保持在真实键帽顶壁量级，避免“整块上盖”伪影。
  const topPlateHeight = clamp(
    0.0011 + zoneConfig.thickness.topMm * 0.00045 + profilePreset.crownLift * 0.22,
    0.0012,
    0.0032
  )
  // 顶板应贴近外壳顶部，不允许落在几何中心附近。
  const topPlateY = keyHeight * 0.5 - topPlateHeight * 0.5 - 0.00008 + profilePreset.crownLift * 0.08

  const rowSculptNormalized = zoneConfig.rowSculpt === 'uniform' ? 0 : clamp((row - 2.2) / 2, -1, 1)
  const topDishDepth = clamp(profilePreset.dish * (0.92 + zoneConfig.thickness.topMm * 0.2), 0.00024, 0.00145)
  const topSurfaceY = topPlateY + topPlateHeight * 0.5 + 0.00003

  const sideWall = clamp(zoneConfig.thickness.sideMm / 1000, 0.00075, 0.0019)
  const topWall = clamp(zoneConfig.thickness.topMm / 1000, 0.00095, 0.0023)
  const cavityWidth = clamp(keyWidth - sideWall * 2, keyWidth * 0.5, keyWidth - 0.0012)
  const cavityDepth = clamp(keyDepth - sideWall * 2, keyDepth * 0.5, keyDepth - 0.0012)
  const cavityHeight = clamp(keyHeight - topWall - 0.00045, 0.0028, 0.014)

  const toneColor = resolveToneBaseColor(zoneConfig.theme, tone)
  const baseColor = shiftColor(toneColor, 0)
  const themeColor = resolveThemeColor(zoneConfig.theme, zoneConfig.colorway)
  const colorwayBase = shiftColor(themeColor, 0)
  const baseMix = zoneConfig.theme === 'default' ? baseColor : colorwayBase

  const topColor = shiftColor(baseMix, materialPreset.colorShift)
  const sideColor = shiftColor(baseMix, -30 + Math.round((zoneConfig.thickness.sideMm - 1.3) * 9))
  const dishColor = shiftColor(topColor, -12)
  const textColor = colorBrightness(topColor) > 144 ? '#1c1d24' : '#f6f7fb'

  const wearBase = clamp(zoneConfig.wearShineLevel / 100, 0, 1)
  const wearBoost =
    zoneConfig.wearPattern === 'wasd_focus' && isWasdKey(keyId)
      ? 0.22
      : zoneConfig.wearPattern === 'space_focus' && keyId.includes('space')
        ? 0.28
        : 0
  const wearRatio = clamp(wearBase + wearBoost, 0, 1)

  const legendOpacity = clamp(zoneConfig.legendOpacity, 0, 1)
  const legendPrimaryOpacity =
    zoneConfig.legendManufacturing === 'double_shot'
      ? legendOpacity
      : zoneConfig.legendManufacturing === 'dye_sub'
        ? legendOpacity * 0.78
        : zoneConfig.legendManufacturing === 'laser'
          ? legendOpacity * 0.92
          : legendOpacity

  const legendSubOpacity =
    zoneConfig.legendManufacturing === 'double_shot'
      ? legendOpacity * 0.92
      : zoneConfig.legendManufacturing === 'dye_sub'
        ? legendOpacity * 0.74
        : zoneConfig.legendManufacturing === 'laser'
          ? legendOpacity * 0.86
          : legendOpacity * 0.86

  const legendColor =
    zoneConfig.legendManufacturing === 'laser'
      ? shiftColor(textColor, 14)
      : zoneConfig.legendManufacturing === 'dye_sub'
        ? shiftColor(textColor, -18)
        : textColor

  const shellRadius = zoneConfig.bodyManufacturing === 'cnc' ? profilePreset.radius * 0.75 : profilePreset.radius

  return {
    zoneConfig,
    profilePreset,
    materialPreset,
    keyWidth,
    keyDepth,
    keyHeight,
    profileAngle,
    topInset,
    topDepthInset,
    topPlateWidth,
    topPlateDepth,
    topPlateHeight,
    topPlateY,
    topDishDepth,
    topSurfaceY,
    cavityWidth,
    cavityDepth,
    cavityHeight,
    shellRadius,
    seamOpacity: zoneConfig.bodyManufacturing === 'injection' ? 0.22 : 0.08,
    topHighlightOpacity: zoneConfig.bodyManufacturing === 'cnc' ? 0.14 : 0.06,
    rowSculptNormalized,
    colors: {
      baseColor: baseMix,
      topColor,
      sideColor,
      dishColor,
      textColor,
      legendColor,
      stemAccent: SWITCH_TYPE_ACCENTS.linear,
    },
    wearRatio,
    legendPrimaryOpacity,
    legendSubOpacity,
  }
}

/**
 * 键帽推导入口：从 keycaps 配置 + key 位置计算最终渲染参数。
 */
export function deriveKeycapRenderParams(options: {
  keycaps: KeycapConfig
  switches: SwitchConfig
  zone: KeycapZone
  keyId: string
  row: number
  width: number
  depth: number
  tone?: RenderTone
}): DerivedKeycapRenderParams {
  const zoneConfig = resolveKeycapZoneConfig(options.keycaps, options.zone, options.keyId)
  const derived = deriveKeycapRenderParamsFromZone({
    zoneConfig,
    keyId: options.keyId,
    row: options.row,
    width: options.width,
    depth: options.depth,
    tone: options.tone,
  })

  return {
    ...derived,
    colors: {
      ...derived.colors,
      stemAccent: SWITCH_TYPE_ACCENTS[options.switches.type],
    },
  }
}

/**
 * 轴体机械推导入口。
 */
export function deriveSwitchRenderParams(options: {
  switches: SwitchConfig
  mods: Pick<InternalsConfig['mods'], 'holeeMod'>
  keyWidth: number
  keyDepth: number
  keyHeight: number
  hasStabilizer: boolean
}): DerivedSwitchRenderParams {
  const { switches, mods, keyWidth, keyDepth, keyHeight, hasStabilizer } = options
  const mechanicalPreset = SWITCH_MECHANICAL_PRESETS[switches.type] || SWITCH_MECHANICAL_PRESETS.linear

  const oringMm = !switches.orings.enabled ? 0 : switches.orings.thickness === 'thick' ? 0.4 : 0.2
  const oringScale = !switches.orings.enabled ? 1 : switches.orings.thickness === 'thick' ? 0.66 : 0.8
  const baseTravel = clamp((mechanicalPreset.travelMm / 1000) * oringScale, 0.0021, 0.0042)

  const switchFootprint = clamp(Math.min(keyWidth, keyDepth) * 0.64, 0.0134, 0.0152)
  const switchTopY = -keyHeight / 2 - 0.00115
  const switchBottomY = switchTopY - 0.0031
  const stemBaseY = -keyHeight / 2 - 0.0006

  const weightScale = clamp((switches.springWeight - 35) / 45, 0, 1)
  const springBase = 160 + weightScale * 140
  const springStiffness =
    switches.springType === 'extended'
      ? springBase * 0.84
      : switches.springType === 'progressive'
        ? springBase * 1.22
        : springBase

  const dampingBase = switches.springType === 'extended' ? 19 : switches.springType === 'progressive' ? 27 : 23
  const lubeBonus = switches.lube === 'stock' ? 0 : switches.lube === 'factory' ? 2 : 4
  const springDamping = dampingBase + lubeBonus

  const bumpCenter = baseTravel * mechanicalPreset.bumpCenterRatio
  const bumpWidth = Math.max(baseTravel * mechanicalPreset.bumpWidthRatio, 0.00045)

  const stabilizerAmplitude = !hasStabilizer
    ? 0
    : switches.stabilizerQuality === 'minor_rattle'
      ? mods.holeeMod
        ? 0.00014
        : 0.00024
      : switches.stabilizerQuality === 'rattle'
        ? mods.holeeMod
          ? 0.00032
          : 0.0006
        : 0

  const springFreeLengthMm = switches.springType === 'extended' ? 18 : switches.springType === 'progressive' ? 16.5 : 15.5
  const springCompressedLengthMm = Math.max(8.2, springFreeLengthMm - mechanicalPreset.travelMm * oringScale * 1.7)
  const springCoils = switches.springType === 'extended' ? 22 : switches.springType === 'progressive' ? 16 : 19
  const springWireDiaMm = switches.springWeight >= 70 ? 0.24 : switches.springWeight >= 55 ? 0.22 : 0.2
  const springOuterDiaMm = switches.springWeight >= 70 ? 5.2 : switches.springWeight >= 55 ? 5 : 4.8
  const filmThicknessMm = switches.film === 'none' ? 0 : switches.film === 'pc' ? 0.15 : switches.film === 'pom' ? 0.13 : 0.12

  return {
    mechanicalPreset,
    baseTravel,
    preTravelMm: mechanicalPreset.preTravelMm,
    springStiffness,
    springDamping,
    bumpCenter,
    bumpWidth,
    bumpStrength: mechanicalPreset.bumpStrength,
    stabilizerAmplitude,
    springFreeLengthMm,
    springCompressedLengthMm,
    springCoils,
    springWireDiaMm,
    springOuterDiaMm,
    oringMm,
    filmThicknessMm,
    switchFootprint,
    switchTopY,
    switchBottomY,
    stemBaseY,
    switchTopColor: SWITCH_HOUSING_COLORS[switches.materials.top],
    switchBottomColor: SWITCH_HOUSING_COLORS[switches.materials.bottom],
    switchStemColor: STEM_COLORS[switches.materials.stem],
    switchTopIsTransparent: switches.materials.top === 'pc',
  }
}

/**
 * 动画参数推导。
 */
export function deriveAnimationParams(options: {
  zoneConfig: KeycapZoneConfig
  row: number
  isFlexLinked: boolean
}): DerivedAnimationParams {
  const { zoneConfig, row, isFlexLinked } = options

  const rowCurveBias =
    zoneConfig.rowSculpt === 'uniform'
      ? 0
      : row <= 1
        ? -0.04
        : row >= 4
          ? 0.02
          : -0.01

  return {
    preloadStageRatio: 0.58,
    preloadStageDuration: 0.025,
    rowCurveBias,
    pressTiltFactor: 0.07,
    jitterTiltFactor: 120,
    flexDrop: isFlexLinked ? 0.00035 : 0,
    travelEpsilon: 0.000002,
    velocityEpsilon: 0.000001,
  }
}

/**
 * 推导轴体结构语义参数。
 * 该函数只处理几何/装配尺寸，不处理动态力学。
 */
export function deriveSwitchStructureParams(options: {
  switches: SwitchConfig
  switchParams: DerivedSwitchRenderParams
}): DerivedSwitchStructureParams {
  const structuralPreset = SWITCH_STRUCTURAL_PRESETS[options.switches.type] || SWITCH_STRUCTURAL_PRESETS.linear
  const toMeters = (mm: number) => mm / 1000

  return {
    preset: structuralPreset,
    housingWidth: clamp(toMeters(structuralPreset.housingWidthMm), 0.0128, options.switchParams.switchFootprint),
    housingDepth: clamp(toMeters(structuralPreset.housingDepthMm), 0.0128, options.switchParams.switchFootprint),
    bottomHousingHeight: clamp(toMeters(structuralPreset.bottomHousingHeightMm), 0.0048, 0.0064),
    topHousingHeight: clamp(toMeters(structuralPreset.topHousingHeightMm), 0.0024, 0.0044),
    stemPoleWidth: clamp(toMeters(structuralPreset.stemPoleWidthMm), 0.0032, 0.0046),
    stemPoleDepth: clamp(toMeters(structuralPreset.stemPoleDepthMm), 0.0032, 0.0046),
    stemPoleHeight: clamp(toMeters(structuralPreset.stemPoleHeightMm), 0.0026, 0.0044),
    stemCrossArm: clamp(toMeters(structuralPreset.stemCrossArmMm), 0.0032, 0.0046),
    stemCrossSlot: clamp(toMeters(structuralPreset.stemCrossSlotMm), 0.00095, 0.0015),
    stemCapHeight: clamp(toMeters(structuralPreset.stemCapHeightMm), 0.0009, 0.0016),
    metalLeafHeight: clamp(toMeters(structuralPreset.metalLeafHeightMm), 0.0035, 0.0058),
    pinLength: clamp(toMeters(structuralPreset.pinLengthMm), 0.0021, 0.0038),
    pinSpan: clamp(toMeters(structuralPreset.pinSpanMm), 0.0042, 0.0064),
    mountPlateClearance: clamp(toMeters(structuralPreset.mountPlateClearanceMm), 0.0001, 0.00032),
  }
}

/**
 * 推导键帽与 stem 卡接挂点参数。
 * 通过 socket 与 stem 的相对尺度计算可用抖动余量和挂点中心。
 */
export function deriveKeycapMountParams(options: {
  keycap: DerivedKeycapRenderParams
  switchStructure: DerivedSwitchStructureParams
}): DerivedKeycapMountParams {
  const preset = KEYCAP_MOUNT_PRESET_MX
  const toMeters = (mm: number) => mm / 1000

  const keycapBaseScale = clamp(Math.min(options.keycap.keyWidth, options.keycap.keyDepth) / 0.01805, 0.9, 1.08)
  const socketOuterWidth = clamp(toMeters(preset.socketOuterWidthMm) * keycapBaseScale, 0.0048, 0.0065)
  const socketOuterDepth = clamp(toMeters(preset.socketOuterDepthMm) * keycapBaseScale, 0.0048, 0.0065)
  const socketDepth = clamp(toMeters(preset.socketDepthMm), 0.0038, 0.0054)
  const socketCrossSlot = clamp(toMeters(preset.socketCrossSlotMm), 0.00102, 0.00155)
  const mountClearance = clamp(toMeters(preset.mountClearanceMm), 0.00005, 0.00018)
  const engagementDepth = clamp(toMeters(preset.engagementDepthMm), 0.0028, socketDepth - 0.0005)
  const ribThickness = clamp(toMeters(preset.ribThicknessMm), 0.0006, 0.00125)
  const ribHeight = clamp(toMeters(preset.ribHeightMm), 0.0018, 0.0034)

  const socketCenterY = -options.keycap.keyHeight / 2 + socketDepth * 0.5 + 0.0002
  const ribCenterY = socketCenterY + ribHeight * 0.28

  const availableLateralGap =
    (socketCrossSlot - options.switchStructure.stemCrossSlot) * 0.5 + mountClearance + options.switchStructure.mountPlateClearance * 0.2
  const lateralJitterLimit = clamp(Math.max(0, availableLateralGap) * 0.3, 0.00002, 0.00026)

  return {
    preset,
    socketOuterWidth,
    socketOuterDepth,
    socketDepth,
    socketCrossSlot,
    engagementDepth,
    mountClearance,
    ribThickness,
    ribHeight,
    socketCenterY,
    ribCenterY,
    lateralJitterLimit,
    stemFollowerJitterRatio: 0.24,
  }
}

/**
 * 推导轻量装配基准。
 * 该基准用于当前阶段的静态限幅和可视化，不参与求解器积分。
 */
export function deriveAssemblyDatumLite(options: {
  switches: DerivedSwitchRenderParams
}): AssemblyDatumLite {
  const caseTopY = CASE_HEIGHT * 0.5
  const caseInnerFloorY = -CASE_HEIGHT * 0.5 + CASE_BOTTOM_THICKNESS
  const plateY = caseTopY - CASE_TOP_LIP_THICKNESS

  return {
    caseTopY,
    caseInnerFloorY,
    plateY,
    switchTopY: options.switches.switchTopY,
    switchBottomY: options.switches.switchBottomY,
    stemBaseY: options.switches.stemBaseY,
    keycapRestCenterY: 0,
  }
}

/**
 * 轴体剖面图指标推导。
 */
export function resolveSwitchBlueprintMetrics(switches: SwitchConfig) {
  const derived = deriveSwitchRenderParams({
    switches,
    mods: { holeeMod: false },
    keyWidth: 0.018,
    keyDepth: 0.018,
    keyHeight: 0.011,
    hasStabilizer: true,
  })

  return {
    totalTravelMm: Number((derived.baseTravel * 1000).toFixed(2)),
    preTravelMm: Number(derived.preTravelMm.toFixed(2)),
    springFreeLengthMm: Number(derived.springFreeLengthMm.toFixed(1)),
    springCompressedMm: Number(derived.springCompressedLengthMm.toFixed(1)),
    springCoils: derived.springCoils,
    springWireDiaMm: Number(derived.springWireDiaMm.toFixed(2)),
    springOuterDiaMm: Number(derived.springOuterDiaMm.toFixed(1)),
    oringMm: Number(derived.oringMm.toFixed(2)),
    filmThicknessMm: Number(derived.filmThicknessMm.toFixed(2)),
  }
}

/**
 * 聚合渲染推导：主 3D 场景统一使用该入口。
 */
export function deriveRenderParams(
  config: {
    keycaps: KeycapConfig
    switches: SwitchConfig
    internals: Pick<InternalsConfig, 'mods'>
  },
  options: {
    zone: KeycapZone
    keyId: string
    row: number
    width: number
    depth: number
    tone?: RenderTone
    isFlexLinked?: boolean
    quality?: RenderQualityTier
  }
): {
  keycap: DerivedKeycapRenderParams
  switches: DerivedSwitchRenderParams
  switchStructure: DerivedSwitchStructureParams
  keycapMount: DerivedKeycapMountParams
  assemblyLite: AssemblyDatumLite
  animation: DerivedAnimationParams
  quality: RenderQualityTier
} {
  const keycap = deriveKeycapRenderParams({
    keycaps: config.keycaps,
    switches: config.switches,
    zone: options.zone,
    keyId: options.keyId,
    row: options.row,
    width: options.width,
    depth: options.depth,
    tone: options.tone,
  })

  const hasStabilizer = options.width >= 2
  const switches = deriveSwitchRenderParams({
    switches: config.switches,
    mods: config.internals.mods,
    keyWidth: keycap.keyWidth,
    keyDepth: keycap.keyDepth,
    keyHeight: keycap.keyHeight,
    hasStabilizer,
  })

  const animation = deriveAnimationParams({
    zoneConfig: keycap.zoneConfig,
    row: options.row,
    isFlexLinked: Boolean(options.isFlexLinked),
  })

  const switchStructure = deriveSwitchStructureParams({
    switches: config.switches,
    switchParams: switches,
  })

  const keycapMount = deriveKeycapMountParams({
    keycap,
    switchStructure,
  })

  const assemblyLite = deriveAssemblyDatumLite({
    switches,
  })

  return {
    keycap,
    switches,
    switchStructure,
    keycapMount,
    assemblyLite,
    animation,
    quality: options.quality || DEFAULT_RENDER_QUALITY,
  }
}
