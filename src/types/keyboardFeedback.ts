/**
 * 参数变更反馈相关类型定义。
 */

/**
 * 所有必须具备“可见反馈”的参数路径。
 * 需要与 `parameterEffects.ts`、控制面板字段保持同步。
 */
export type ParameterPath =
  | 'layout.formFactor'
  | 'layout.standard'
  | 'layout.variant'
  | 'layout.specialStructure.hhkbBlockers'
  | 'layout.specialStructure.trackpointCluster'
  | 'case.material'
  | 'case.finish'
  | 'case.mount'
  | 'case.weight.enabled'
  | 'case.weight.material'
  | 'case.weight.finish'
  | 'case.screws.type'
  | 'case.screws.finish'
  | 'internals.plateMaterial'
  | 'internals.plateFlexCuts'
  | 'internals.foams.caseFoam'
  | 'internals.foams.plateFoam'
  | 'internals.foams.peSheet'
  | 'internals.foams.ixpe'
  | 'internals.foams.spacebarFoam'
  | 'internals.mods.tapeMod'
  | 'internals.mods.holeeMod'
  | 'internals.mods.peFoamMod'
  | 'switches.type'
  | 'switches.materials.top'
  | 'switches.materials.stem'
  | 'switches.materials.bottom'
  | 'switches.springWeight'
  | 'switches.springType'
  | 'switches.lube'
  | 'switches.film'
  | 'switches.stabilizerQuality'
  | 'switches.orings.enabled'
  | 'switches.orings.thickness'
  | 'keycaps.zones.profile'
  | 'keycaps.zones.rowSculpt'
  | 'keycaps.zones.thickness.topMm'
  | 'keycaps.zones.thickness.sideMm'
  | 'keycaps.zones.material'
  | 'keycaps.zones.bodyManufacturing'
  | 'keycaps.zones.legendManufacturing'
  | 'keycaps.zones.legendPrimary'
  | 'keycaps.zones.legendSub'
  | 'keycaps.zones.legendPosition'
  | 'keycaps.zones.legendOpacity'
  | 'keycaps.zones.theme'
  | 'keycaps.zones.colorway'
  | 'keycaps.zones.wearShineLevel'
  | 'keycaps.zones.wearPattern'
  | 'keycaps.zones.hollowFactor'
  | 'keycaps.overrides'
  | 'keycaps.artisan.enabled'
  | 'keycaps.artisan.items'
  | 'modules.oled.enabled'
  | 'modules.oled.display'
  | 'modules.oled.position'
  | 'modules.knob.enabled'
  | 'modules.knob.count'
  | 'modules.knob.position'
  | 'modules.knob.detent'
  | 'modules.trackpoint.enabled'
  | 'modules.trackpoint.color'
  | 'modules.trackpoint.capType'
  | 'modules.trackpoint.sensitivity'
  | 'modules.trackpoint.zone'
  | 'modules.lighting.enabled'
  | 'modules.lighting.mode'
  | 'modules.lighting.color'
  | 'modules.lighting.reactiveSpread'
  | 'deskSetup.deskmat'
  | 'deskSetup.deskmatColor'
  | 'deskSetup.deskSurface'
  | 'deskSetup.cable.enabled'
  | 'deskSetup.cable.type'
  | 'deskSetup.cable.color'
  | 'acousticOverrides.brightness'
  | 'acousticOverrides.dampening'
  | 'acousticOverrides.reverb'
  | 'environment.deskmat'
  | 'environment.deskmatColor'
  | 'environment.rgbEnabled'
  | 'environment.rgbMode'
  | 'environment.rgbColor'
  | 'environment.cable.enabled'
  | 'environment.cable.type'
  | 'environment.cable.color'
  | 'environment.oled.enabled'
  | 'environment.oled.display'

/**
 * 参数反馈描述符：用于 Overlay 展示“改了什么、影响什么”。
 */
export interface ParameterEffectDescriptor {
  /** 参数路径（唯一标识）。 */
  path: ParameterPath
  /** 参数中文标签。 */
  label: string
  /** 参数影响说明。 */
  effect: string
}

/**
 * Store 到 UI 的即时反馈事件载荷。
 */
export interface VisualFeedbackEvent {
  /** 事件类别：单参数变更或批量摘要。 */
  kind: 'parameter' | 'summary'
  /** 展示标题。 */
  label: string
  /** 当前值文本。 */
  value: string
  /** 影响说明文本。 */
  effect: string
  /** 事件时间戳（ms）。 */
  timestamp: number
  /** 参数路径（摘要事件可为空）。 */
  path?: ParameterPath
}
