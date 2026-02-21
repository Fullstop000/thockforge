import { create } from 'zustand'
import { decodeBuildCode, encodeBuildCodeV3, migrateEnvironmentToV3, readLegacyLayoutFormFactor } from '@/store/keyboard/buildCode'
import {
  AcousticOverrides,
  CaseConfig,
  CaseFinish,
  CaseMaterial,
  CableType,
  DEFAULT_ACOUSTIC_OVERRIDES,
  DEFAULT_CASE,
  DEFAULT_DESK_SETUP,
  DEFAULT_INTERNALS,
  DEFAULT_KEYCAPS,
  DEFAULT_LAYOUT,
  DEFAULT_MODULES,
  DEFAULT_SWITCHES,
  DeskSetupConfig,
  DeskmatType,
  EnvironmentConfig,
  FilmType,
  HousingMaterial,
  InternalsConfig,
  KeyboardState,
  KeycapConfig,
  KeycapLegendLang,
  KeycapLegendManufacturing,
  KeycapLegendPosition,
  KeycapMaterial,
  KeycapProfile,
  KeycapZone,
  KeycapZoneConfig,
  LayoutConfig,
  LayoutStandard,
  LayoutType,
  LayoutVariant,
  LubeState,
  ModulesConfig,
  MountType,
  ParameterPath,
  PlateMaterial,
  StemMaterial,
  SwitchConfig,
  SwitchType,
  WeightFinish,
  WeightMaterial,
  RenderVisibilityState,
  DEFAULT_RUNTIME_STATE,
} from '@/types/keyboard'
import {
  ACOUSTIC_PARAMETER_PATHS,
  CASE_PARAMETER_PATHS,
  DESK_SETUP_PARAMETER_PATHS,
  INTERNALS_PARAMETER_PATHS,
  LAYOUT_PARAMETER_PATHS,
  MODULE_PARAMETER_PATHS,
  SWITCH_PARAMETER_PATHS,
  createVisualFeedbackEvent,
} from '@/visual/parameterEffects'

type KeyboardSnapshot = Pick<
  KeyboardState,
  'layout' | 'case' | 'internals' | 'switches' | 'keycaps' | 'modules' | 'deskSetup' | 'acousticOverrides'
>
type UnknownRecord = Record<string, unknown>
type KeycapPatch = {
  zones?: Partial<Record<KeycapZone, Partial<KeycapZoneConfig>>>
  overrides?: Record<string, Partial<KeycapZoneConfig>>
  artisan?: Partial<KeycapConfig['artisan']>
}

const LAYOUT_TYPES: LayoutType[] = ['40', '60', '65', '75', '80', '980', '100', 'alice']
const LAYOUT_STANDARDS: LayoutStandard[] = ['ansi', 'iso', 'jis']
const LAYOUT_VARIANTS: LayoutVariant[] = ['standard', 'hhkb', 'thinkpad_style']

const CASE_MATERIALS: CaseMaterial[] = ['alu_6063', 'alu_7075', 'pc', 'acrylic', 'abs', 'wood']
const CASE_FINISHES: CaseFinish[] = ['anodized', 'e-white', 'cerakote', 'powdercoat', 'polished', 'beadblasted']
const MOUNT_TYPES: MountType[] = ['gasket_poron', 'gasket_silicone', 'top', 'tray', 'oring_burger', 'plateless']
const WEIGHT_MATERIALS: WeightMaterial[] = ['brass', 'stainless', 'copper', 'alu']
const WEIGHT_FINISHES: WeightFinish[] = ['pvd_mirror', 'pvd_brushed', 'beadblasted', 'blued', 'cerakote']
const SCREW_TYPES: Array<CaseConfig['screws']['type']> = ['flathead', 'hex']
const SCREW_FINISHES: Array<CaseConfig['screws']['finish']> = ['gold', 'silver', 'titanium_blued']

const PLATE_MATERIALS: PlateMaterial[] = ['alu', 'brass', 'pc', 'fr4', 'pom', 'carbon', 'ppe']

const SWITCH_TYPES: SwitchType[] = ['linear', 'tactile', 'clicky', 'silent']
const HOUSING_MATERIALS: HousingMaterial[] = ['nylon', 'pc', 'pom', 'upe']
const STEM_MATERIALS: StemMaterial[] = ['pom', 'ly', 'upe', 'pe']
const SPRING_TYPES: Array<SwitchConfig['springType']> = ['single', 'extended', 'progressive']
const LUBE_STATES: LubeState[] = ['stock', 'factory', 'hand_lubed_thin', 'hand_lubed_thick']
const FILM_TYPES: FilmType[] = ['none', 'pc', 'pom', 'pet']
const STABILIZER_QUALITIES: Array<SwitchConfig['stabilizerQuality']> = ['perfect', 'minor_rattle', 'rattle']
const ORING_THICKNESS: Array<SwitchConfig['orings']['thickness']> = ['thin', 'thick']

const KEYCAP_ZONES: KeycapZone[] = ['alpha', 'modifier', 'function', 'nav', 'numpad', 'space']
const KEYCAP_PROFILES: KeycapProfile[] = ['cherry', 'sa', 'oem', 'xda', 'dsa', 'mt3', 'kat']
const KEYCAP_MATERIALS: KeycapMaterial[] = ['pbt', 'abs', 'pc', 'pom', 'pbt_double', 'resin', 'ceramic', 'metal_alu', 'metal_brass']
const KEYCAP_ROW_SCULPTS: Array<KeycapZoneConfig['rowSculpt']> = ['uniform', 'sculpted']
const KEYCAP_BODY_MFG: Array<KeycapZoneConfig['bodyManufacturing']> = ['injection', 'cnc']
const KEYCAP_LEGEND_MFG: KeycapLegendManufacturing[] = ['double_shot', 'dye_sub', 'laser', 'blank']
const KEYCAP_LEGEND_LANG: KeycapLegendLang[] = ['latin', 'kana', 'cyrillic', 'hangul', 'fantasy', 'none']
const KEYCAP_LEGEND_POSITIONS: KeycapLegendPosition[] = ['center', 'top_left', 'front_side', 'side_shine']
const KEYCAP_WEAR_PATTERNS: Array<KeycapZoneConfig['wearPattern']> = ['uniform', 'wasd_focus', 'space_focus']

const DESKMAT_TYPES: DeskmatType[] = ['none', 'cloth', 'glass', 'leather', 'wood']
const DESK_SURFACES: Array<DeskSetupConfig['deskSurface']> = ['wood', 'glass', 'stone', 'laminate']
const CABLE_TYPES: CableType[] = ['aviator', 'lemo', 'coiled_usb', 'straight_usb']

const OLED_DISPLAYS: Array<ModulesConfig['oled']['display']> = ['wpm', 'time', 'gif', 'custom']
const OLED_POSITIONS: Array<ModulesConfig['oled']['position']> = ['top_right', 'top_left', 'center']
const KNOB_POSITIONS: Array<ModulesConfig['knob']['position']> = ['top_right', 'right_edge', 'left_edge']
const KNOB_DETENT: Array<ModulesConfig['knob']['detent']> = ['soft', 'hard']
const TRACKPOINT_CAP_TYPES: Array<ModulesConfig['trackpoint']['capType']> = ['classic', 'soft_rim', 'low_profile']
const TRACKPOINT_ZONES: Array<ModulesConfig['trackpoint']['zone']> = ['g_h_b', 'center_cluster']
const LIGHTING_MODES: Array<ModulesConfig['lighting']['mode']> = ['static', 'wave', 'reactive', 'rainbow']

/**
 * Safe object guard for untrusted import payloads.
 */
function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function isEnumValue<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === 'string' && options.includes(value as T)
}

function readEnum<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return isEnumValue(value, options) ? value : fallback
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function readNumber(value: unknown, fallback: number, min?: number, max?: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback
  }
  const lower = typeof min === 'number' ? Math.max(min, value) : value
  return typeof max === 'number' ? Math.min(max, lower) : lower
}

function readColor(value: unknown, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback
  }
  const candidate = value.trim()
  return /^#[0-9a-fA-F]{6}$/.test(candidate) ? candidate : fallback
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback
}

function pickSnapshot(state: KeyboardState): KeyboardSnapshot {
  return {
    layout: state.layout,
    case: state.case,
    internals: state.internals,
    switches: state.switches,
    keycaps: state.keycaps,
    modules: state.modules,
    deskSetup: state.deskSetup,
    acousticOverrides: state.acousticOverrides,
  }
}

function readSnapshotByPath(snapshot: KeyboardSnapshot, path: ParameterPath): unknown {
  const keys = path.split('.')
  let current: unknown = snapshot

  for (const key of keys) {
    if (!isRecord(current)) {
      return undefined
    }
    current = current[key]
  }

  return current
}

function valuesEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * Returns the first changed path in a deterministic order for overlay emission.
 */
function findFirstChangedPath(paths: readonly ParameterPath[], prev: KeyboardSnapshot, next: KeyboardSnapshot): ParameterPath | null {
  for (const path of paths) {
    if (!valuesEqual(readSnapshotByPath(prev, path), readSnapshotByPath(next, path))) {
      return path
    }
  }
  return null
}

function mergeLayoutConfig(base: LayoutConfig, patch: Partial<LayoutConfig>): LayoutConfig {
  return {
    ...base,
    ...patch,
    specialStructure: {
      ...base.specialStructure,
      ...(patch.specialStructure || {}),
    },
  }
}

function mergeCaseConfig(base: CaseConfig, patch: Partial<CaseConfig>): CaseConfig {
  return {
    ...base,
    ...patch,
    weight: {
      ...base.weight,
      ...(patch.weight || {}),
    },
    screws: {
      ...base.screws,
      ...(patch.screws || {}),
    },
  }
}

function mergeInternalsConfig(base: InternalsConfig, patch: Partial<InternalsConfig>): InternalsConfig {
  return {
    ...base,
    ...patch,
    foams: {
      ...base.foams,
      ...(patch.foams || {}),
    },
    mods: {
      ...base.mods,
      ...(patch.mods || {}),
    },
  }
}

function mergeSwitchConfig(base: SwitchConfig, patch: Partial<SwitchConfig>): SwitchConfig {
  return {
    ...base,
    ...patch,
    materials: {
      ...base.materials,
      ...(patch.materials || {}),
    },
    orings: {
      ...base.orings,
      ...(patch.orings || {}),
    },
  }
}

function mergeKeycapConfig(base: KeycapConfig, patch: KeycapPatch): KeycapConfig {
  const nextZones: KeycapConfig['zones'] = {
    ...base.zones,
  }

  if (patch.zones) {
    for (const zone of KEYCAP_ZONES) {
      const zonePatch = patch.zones[zone]
      if (!zonePatch) {
        continue
      }

      nextZones[zone] = {
        ...base.zones[zone],
        ...zonePatch,
        thickness: {
          ...base.zones[zone].thickness,
          ...(zonePatch.thickness || {}),
        },
      }
    }
  }

  return {
    ...base,
    ...patch,
    zones: nextZones,
    overrides: {
      ...base.overrides,
      ...(patch.overrides || {}),
    },
    artisan: {
      ...base.artisan,
      ...(patch.artisan || {}),
      items: Array.isArray(patch.artisan?.items) ? patch.artisan.items : base.artisan.items,
    },
  }
}

function mergeModulesConfig(base: ModulesConfig, patch: Partial<ModulesConfig>): ModulesConfig {
  return {
    ...base,
    ...patch,
    oled: {
      ...base.oled,
      ...(patch.oled || {}),
    },
    knob: {
      ...base.knob,
      ...(patch.knob || {}),
    },
    trackpoint: {
      ...base.trackpoint,
      ...(patch.trackpoint || {}),
    },
    lighting: {
      ...base.lighting,
      ...(patch.lighting || {}),
    },
  }
}

function mergeDeskSetupConfig(base: DeskSetupConfig, patch: Partial<DeskSetupConfig>): DeskSetupConfig {
  return {
    ...base,
    ...patch,
    cable: {
      ...base.cable,
      ...(patch.cable || {}),
    },
  }
}

/**
 * 合并运行态可见性配置。
 * 仅用于临时调试，不写入持久化 Build Code。
 */
function mergeRenderVisibility(base: RenderVisibilityState, patch: Partial<RenderVisibilityState>): RenderVisibilityState {
  return {
    ...base,
    ...patch,
  }
}

function mergeAcousticOverrides(base: AcousticOverrides, patch: Partial<AcousticOverrides>): AcousticOverrides {
  return {
    ...base,
    ...patch,
  }
}

function normalizeLayoutConfig(input: unknown): LayoutConfig {
  const source = isRecord(input) ? input : {}
  const special = isRecord(source.specialStructure) ? source.specialStructure : {}

  return {
    formFactor: readEnum(source.formFactor, LAYOUT_TYPES, DEFAULT_LAYOUT.formFactor),
    standard: readEnum(source.standard, LAYOUT_STANDARDS, DEFAULT_LAYOUT.standard),
    variant: readEnum(source.variant, LAYOUT_VARIANTS, DEFAULT_LAYOUT.variant),
    specialStructure: {
      hhkbBlockers: readBoolean(special.hhkbBlockers, DEFAULT_LAYOUT.specialStructure.hhkbBlockers),
      trackpointCluster: readBoolean(special.trackpointCluster, DEFAULT_LAYOUT.specialStructure.trackpointCluster),
    },
  }
}

function normalizeCaseConfig(input: unknown): CaseConfig {
  const source = isRecord(input) ? input : {}
  const weight = isRecord(source.weight) ? source.weight : {}
  const screws = isRecord(source.screws) ? source.screws : {}

  return {
    material: readEnum(source.material, CASE_MATERIALS, DEFAULT_CASE.material),
    finish: readEnum(source.finish, CASE_FINISHES, DEFAULT_CASE.finish),
    mount: readEnum(source.mount, MOUNT_TYPES, DEFAULT_CASE.mount),
    weight: {
      enabled: readBoolean(weight.enabled, DEFAULT_CASE.weight.enabled),
      material: readEnum(weight.material, WEIGHT_MATERIALS, DEFAULT_CASE.weight.material),
      finish: readEnum(weight.finish, WEIGHT_FINISHES, DEFAULT_CASE.weight.finish),
    },
    screws: {
      type: readEnum(screws.type, SCREW_TYPES, DEFAULT_CASE.screws.type),
      finish: readEnum(screws.finish, SCREW_FINISHES, DEFAULT_CASE.screws.finish),
    },
  }
}

function normalizeInternalsConfig(input: unknown): InternalsConfig {
  const source = isRecord(input) ? input : {}
  const foams = isRecord(source.foams) ? source.foams : {}
  const mods = isRecord(source.mods) ? source.mods : {}

  return {
    plateMaterial: readEnum(source.plateMaterial, PLATE_MATERIALS, DEFAULT_INTERNALS.plateMaterial),
    plateFlexCuts: readBoolean(source.plateFlexCuts, DEFAULT_INTERNALS.plateFlexCuts),
    foams: {
      caseFoam: readBoolean(foams.caseFoam, DEFAULT_INTERNALS.foams.caseFoam),
      plateFoam: readBoolean(foams.plateFoam, DEFAULT_INTERNALS.foams.plateFoam),
      peSheet: readBoolean(foams.peSheet, DEFAULT_INTERNALS.foams.peSheet),
      ixpe: readBoolean(foams.ixpe, DEFAULT_INTERNALS.foams.ixpe),
      spacebarFoam: readBoolean(foams.spacebarFoam, DEFAULT_INTERNALS.foams.spacebarFoam),
    },
    mods: {
      tapeMod: readNumber(mods.tapeMod, DEFAULT_INTERNALS.mods.tapeMod, 0, 3),
      holeeMod: readBoolean(mods.holeeMod, DEFAULT_INTERNALS.mods.holeeMod),
      peFoamMod: readBoolean(mods.peFoamMod, DEFAULT_INTERNALS.mods.peFoamMod),
    },
  }
}

function normalizeSwitchConfig(input: unknown): SwitchConfig {
  const source = isRecord(input) ? input : {}
  const materials = isRecord(source.materials) ? source.materials : {}
  const orings = isRecord(source.orings) ? source.orings : {}

  return {
    type: readEnum(source.type, SWITCH_TYPES, DEFAULT_SWITCHES.type),
    materials: {
      top: readEnum(materials.top, HOUSING_MATERIALS, DEFAULT_SWITCHES.materials.top),
      stem: readEnum(materials.stem, STEM_MATERIALS, DEFAULT_SWITCHES.materials.stem),
      bottom: readEnum(materials.bottom, HOUSING_MATERIALS, DEFAULT_SWITCHES.materials.bottom),
    },
    springWeight: readNumber(source.springWeight, DEFAULT_SWITCHES.springWeight, 35, 80),
    springType: readEnum(source.springType, SPRING_TYPES, DEFAULT_SWITCHES.springType),
    lube: readEnum(source.lube, LUBE_STATES, DEFAULT_SWITCHES.lube),
    film: readEnum(source.film, FILM_TYPES, DEFAULT_SWITCHES.film),
    stabilizerQuality: readEnum(source.stabilizerQuality, STABILIZER_QUALITIES, DEFAULT_SWITCHES.stabilizerQuality),
    orings: {
      enabled: readBoolean(orings.enabled, DEFAULT_SWITCHES.orings.enabled),
      thickness: readEnum(orings.thickness, ORING_THICKNESS, DEFAULT_SWITCHES.orings.thickness),
    },
  }
}

function normalizeKeycapZoneConfig(input: unknown, fallback: KeycapZoneConfig): KeycapZoneConfig {
  const source = isRecord(input) ? input : {}
  const thickness = isRecord(source.thickness) ? source.thickness : {}

  return {
    profile: readEnum(source.profile, KEYCAP_PROFILES, fallback.profile),
    rowSculpt: readEnum(source.rowSculpt, KEYCAP_ROW_SCULPTS, fallback.rowSculpt),
    thickness: {
      topMm: readNumber(thickness.topMm, fallback.thickness.topMm, 1.0, 2.2),
      sideMm: readNumber(thickness.sideMm, fallback.thickness.sideMm, 0.8, 2.0),
    },
    material: readEnum(source.material, KEYCAP_MATERIALS, fallback.material),
    bodyManufacturing: readEnum(source.bodyManufacturing, KEYCAP_BODY_MFG, fallback.bodyManufacturing),
    legendManufacturing: readEnum(source.legendManufacturing, KEYCAP_LEGEND_MFG, fallback.legendManufacturing),
    legendPrimary: readEnum(source.legendPrimary, KEYCAP_LEGEND_LANG, fallback.legendPrimary),
    legendSub: readEnum(source.legendSub, KEYCAP_LEGEND_LANG, fallback.legendSub),
    legendPosition: readEnum(source.legendPosition, KEYCAP_LEGEND_POSITIONS, fallback.legendPosition),
    legendOpacity: readNumber(source.legendOpacity, fallback.legendOpacity, 0, 1),
    theme: readString(source.theme, fallback.theme),
    colorway: readString(source.colorway, fallback.colorway),
    wearShineLevel: readNumber(source.wearShineLevel, fallback.wearShineLevel, 0, 100),
    wearPattern: readEnum(source.wearPattern, KEYCAP_WEAR_PATTERNS, fallback.wearPattern),
    hollowFactor: readNumber(source.hollowFactor, fallback.hollowFactor, 0.5, 1.5),
  }
}

function normalizeLegacyKeycapConfig(input: UnknownRecord): KeycapConfig {
  const legacyProfile = readEnum(input.profile, KEYCAP_PROFILES, DEFAULT_KEYCAPS.zones.alpha.profile)
  const legacyMaterial = readEnum(input.material, KEYCAP_MATERIALS, DEFAULT_KEYCAPS.zones.alpha.material)
  const legacyTheme = readString(input.theme, DEFAULT_KEYCAPS.zones.alpha.theme)
  const artisanEnabled = readBoolean(input.artisanEsc, DEFAULT_KEYCAPS.artisan.enabled)
  const artisanUrl = typeof input.artisanEscUrl === 'string' ? input.artisanEscUrl.trim() : ''

  const baseZone: KeycapZoneConfig = {
    ...DEFAULT_KEYCAPS.zones.alpha,
    profile: legacyProfile,
    material: legacyMaterial,
    theme: legacyTheme,
  }

  const zones: KeycapConfig['zones'] = {
    alpha: { ...baseZone },
    modifier: { ...baseZone, colorway: 'mod' },
    function: { ...baseZone, colorway: 'fn' },
    nav: { ...baseZone, colorway: 'nav' },
    numpad: { ...baseZone, colorway: 'numpad' },
    space: { ...baseZone, wearPattern: 'space_focus' },
  }

  return {
    zones,
    overrides: {},
    artisan: {
      enabled: artisanEnabled,
      items: artisanUrl ? [{ keyId: 'esc', url: artisanUrl, materialHint: 'resin' as const }] : [],
    },
  }
}

function normalizeKeycapConfig(input: unknown): KeycapConfig {
  const source = isRecord(input) ? input : {}

  if (!isRecord(source.zones)) {
    return normalizeLegacyKeycapConfig(source)
  }

  const zones: KeycapConfig['zones'] = {
    alpha: normalizeKeycapZoneConfig(source.zones.alpha, DEFAULT_KEYCAPS.zones.alpha),
    modifier: normalizeKeycapZoneConfig(source.zones.modifier, DEFAULT_KEYCAPS.zones.modifier),
    function: normalizeKeycapZoneConfig(source.zones.function, DEFAULT_KEYCAPS.zones.function),
    nav: normalizeKeycapZoneConfig(source.zones.nav, DEFAULT_KEYCAPS.zones.nav),
    numpad: normalizeKeycapZoneConfig(source.zones.numpad, DEFAULT_KEYCAPS.zones.numpad),
    space: normalizeKeycapZoneConfig(source.zones.space, DEFAULT_KEYCAPS.zones.space),
  }

  const overridesInput = isRecord(source.overrides) ? source.overrides : {}
  const overrides: KeycapConfig['overrides'] = {}

  for (const [keyId, zonePatchInput] of Object.entries(overridesInput)) {
    if (!isRecord(zonePatchInput)) {
      continue
    }
    overrides[keyId] = normalizeKeycapZoneConfig(zonePatchInput, zones.alpha)
  }

  const artisanSource = isRecord(source.artisan) ? source.artisan : {}
  const artisanItems = Array.isArray(artisanSource.items)
    ? artisanSource.items.filter((item): item is { keyId: string; url: string; materialHint?: string } => {
      if (!isRecord(item)) {
        return false
      }
      return typeof item.keyId === 'string' && typeof item.url === 'string' && item.url.trim().length > 0
    })
    : []

  return {
    zones,
    overrides,
    artisan: {
      enabled: readBoolean(artisanSource.enabled, DEFAULT_KEYCAPS.artisan.enabled),
      items: artisanItems.map((item) => ({
        keyId: item.keyId,
        url: item.url,
        materialHint:
          item.materialHint === 'resin' || item.materialHint === 'metal' || item.materialHint === 'stone' || item.materialHint === 'other'
            ? item.materialHint
            : undefined,
      })),
    },
  }
}

function normalizeModulesConfig(input: unknown): ModulesConfig {
  const source = isRecord(input) ? input : {}
  const oled = isRecord(source.oled) ? source.oled : {}
  const knob = isRecord(source.knob) ? source.knob : {}
  const trackpoint = isRecord(source.trackpoint) ? source.trackpoint : {}
  const lighting = isRecord(source.lighting) ? source.lighting : {}

  return {
    oled: {
      enabled: readBoolean(oled.enabled, DEFAULT_MODULES.oled.enabled),
      display: readEnum(oled.display, OLED_DISPLAYS, DEFAULT_MODULES.oled.display),
      position: readEnum(oled.position, OLED_POSITIONS, DEFAULT_MODULES.oled.position),
    },
    knob: {
      enabled: readBoolean(knob.enabled, DEFAULT_MODULES.knob.enabled),
      count: readNumber(knob.count, DEFAULT_MODULES.knob.count, 1, 4),
      position: readEnum(knob.position, KNOB_POSITIONS, DEFAULT_MODULES.knob.position),
      detent: readEnum(knob.detent, KNOB_DETENT, DEFAULT_MODULES.knob.detent),
    },
    trackpoint: {
      enabled: readBoolean(trackpoint.enabled, DEFAULT_MODULES.trackpoint.enabled),
      color: readColor(trackpoint.color, DEFAULT_MODULES.trackpoint.color),
      capType: readEnum(trackpoint.capType, TRACKPOINT_CAP_TYPES, DEFAULT_MODULES.trackpoint.capType),
      sensitivity: readNumber(trackpoint.sensitivity, DEFAULT_MODULES.trackpoint.sensitivity, 0.1, 2),
      zone: readEnum(trackpoint.zone, TRACKPOINT_ZONES, DEFAULT_MODULES.trackpoint.zone),
    },
    lighting: {
      enabled: readBoolean(lighting.enabled, DEFAULT_MODULES.lighting.enabled),
      mode: readEnum(lighting.mode, LIGHTING_MODES, DEFAULT_MODULES.lighting.mode),
      color: readColor(lighting.color, DEFAULT_MODULES.lighting.color),
      reactiveSpread: readNumber(lighting.reactiveSpread, DEFAULT_MODULES.lighting.reactiveSpread, 0, 1),
    },
  }
}

function normalizeDeskSetupConfig(input: unknown): DeskSetupConfig {
  const source = isRecord(input) ? input : {}
  const cable = isRecord(source.cable) ? source.cable : {}

  return {
    deskmat: readEnum(source.deskmat, DESKMAT_TYPES, DEFAULT_DESK_SETUP.deskmat),
    deskmatColor: readColor(source.deskmatColor, DEFAULT_DESK_SETUP.deskmatColor),
    deskSurface: readEnum(source.deskSurface, DESK_SURFACES, DEFAULT_DESK_SETUP.deskSurface),
    cable: {
      enabled: readBoolean(cable.enabled, DEFAULT_DESK_SETUP.cable.enabled),
      type: readEnum(cable.type, CABLE_TYPES, DEFAULT_DESK_SETUP.cable.type),
      color: readColor(cable.color, DEFAULT_DESK_SETUP.cable.color),
    },
  }
}

function normalizeAcousticOverrides(input: unknown): AcousticOverrides {
  const source = isRecord(input) ? input : {}

  return {
    brightness: readNumber(source.brightness, DEFAULT_ACOUSTIC_OVERRIDES.brightness, 0.5, 1.5),
    dampening: readNumber(source.dampening, DEFAULT_ACOUSTIC_OVERRIDES.dampening, 0.5, 1.5),
    reverb: readNumber(source.reverb, DEFAULT_ACOUSTIC_OVERRIDES.reverb, 0, 1),
  }
}

/**
 * Centralized domain update flow: merge, set, and emit visual event.
 */
function applyDomainUpdate(
  paths: readonly ParameterPath[],
  prev: KeyboardSnapshot,
  next: KeyboardSnapshot,
  emitVisualEvent: KeyboardState['emitVisualEvent']
) {
  const changedPath = findFirstChangedPath(paths, prev, next)
  if (!changedPath) {
    return
  }
  emitVisualEvent(changedPath, readSnapshotByPath(prev, changedPath), readSnapshotByPath(next, changedPath))
}

function resolveKeycapUpdatePath(params: KeycapPatch): ParameterPath {
  if (params.artisan?.items) {
    return 'keycaps.artisan.items'
  }

  if (typeof params.artisan?.enabled === 'boolean') {
    return 'keycaps.artisan.enabled'
  }

  if (params.overrides) {
    return 'keycaps.overrides'
  }

  if (params.zones) {
    const zonePatch = Object.values(params.zones).find((value) => value)
    if (zonePatch?.thickness?.topMm !== undefined) {
      return 'keycaps.zones.thickness.topMm'
    }
    if (zonePatch?.thickness?.sideMm !== undefined) {
      return 'keycaps.zones.thickness.sideMm'
    }
    if (zonePatch?.profile) {
      return 'keycaps.zones.profile'
    }
    if (zonePatch?.rowSculpt) {
      return 'keycaps.zones.rowSculpt'
    }
    if (zonePatch?.material) {
      return 'keycaps.zones.material'
    }
    if (zonePatch?.bodyManufacturing) {
      return 'keycaps.zones.bodyManufacturing'
    }
    if (zonePatch?.legendManufacturing) {
      return 'keycaps.zones.legendManufacturing'
    }
    if (zonePatch?.legendPrimary) {
      return 'keycaps.zones.legendPrimary'
    }
    if (zonePatch?.legendSub) {
      return 'keycaps.zones.legendSub'
    }
    if (zonePatch?.legendPosition) {
      return 'keycaps.zones.legendPosition'
    }
    if (zonePatch?.legendOpacity !== undefined) {
      return 'keycaps.zones.legendOpacity'
    }
    if (zonePatch?.theme) {
      return 'keycaps.zones.theme'
    }
    if (zonePatch?.colorway) {
      return 'keycaps.zones.colorway'
    }
    if (zonePatch?.wearShineLevel !== undefined) {
      return 'keycaps.zones.wearShineLevel'
    }
    if (zonePatch?.wearPattern) {
      return 'keycaps.zones.wearPattern'
    }
    if (zonePatch?.hollowFactor !== undefined) {
      return 'keycaps.zones.hollowFactor'
    }
  }

  return 'keycaps.zones.theme'
}

const useKeyboardStore = create<KeyboardState>((set, get) => ({
  layout: DEFAULT_LAYOUT,
  case: DEFAULT_CASE,
  internals: DEFAULT_INTERNALS,
  switches: DEFAULT_SWITCHES,
  keycaps: DEFAULT_KEYCAPS,
  modules: DEFAULT_MODULES,
  deskSetup: DEFAULT_DESK_SETUP,
  acousticOverrides: DEFAULT_ACOUSTIC_OVERRIDES,
  activeKeys: [...DEFAULT_RUNTIME_STATE.activeKeys],
  activeKey: DEFAULT_RUNTIME_STATE.activeKey,
  typingTest: { ...DEFAULT_RUNTIME_STATE.typingTest },
  renderVisibility: { ...DEFAULT_RUNTIME_STATE.renderVisibility },
  lastVisualEvent: DEFAULT_RUNTIME_STATE.lastVisualEvent,

  emitVisualEvent: (path, _oldValue, newValue) => {
    set({
      lastVisualEvent: createVisualFeedbackEvent(path, newValue),
    })
  },

  emitSummaryEvent: (label, effect, value = '') => {
    set({
      lastVisualEvent: {
        kind: 'summary',
        label,
        value,
        effect,
        timestamp: Date.now(),
      },
    })
  },

  updateLayout: (params) => {
    const state = get()
    const prevSnapshot = pickSnapshot(state)
    const nextLayout = mergeLayoutConfig(state.layout, params)
    const nextSnapshot: KeyboardSnapshot = { ...prevSnapshot, layout: nextLayout }

    set({ layout: nextLayout })
    applyDomainUpdate(LAYOUT_PARAMETER_PATHS, prevSnapshot, nextSnapshot, get().emitVisualEvent)
  },

  updateCase: (params) => {
    const state = get()
    const prevSnapshot = pickSnapshot(state)
    const nextCase = mergeCaseConfig(state.case, params)
    const nextSnapshot: KeyboardSnapshot = { ...prevSnapshot, case: nextCase }

    set({ case: nextCase })
    applyDomainUpdate(CASE_PARAMETER_PATHS, prevSnapshot, nextSnapshot, get().emitVisualEvent)
  },

  updateInternals: (params) => {
    const state = get()
    const prevSnapshot = pickSnapshot(state)
    const nextInternals = mergeInternalsConfig(state.internals, params)
    const nextSnapshot: KeyboardSnapshot = { ...prevSnapshot, internals: nextInternals }

    set({ internals: nextInternals })
    applyDomainUpdate(INTERNALS_PARAMETER_PATHS, prevSnapshot, nextSnapshot, get().emitVisualEvent)
  },

  updateSwitches: (params) => {
    const state = get()
    const prevSnapshot = pickSnapshot(state)
    const nextSwitches = mergeSwitchConfig(state.switches, params)
    const nextSnapshot: KeyboardSnapshot = { ...prevSnapshot, switches: nextSwitches }

    set({ switches: nextSwitches })
    applyDomainUpdate(SWITCH_PARAMETER_PATHS, prevSnapshot, nextSnapshot, get().emitVisualEvent)
  },

  updateKeycaps: (params) => {
    const state = get()
    const nextKeycaps = mergeKeycapConfig(state.keycaps, params)
    const path = resolveKeycapUpdatePath(params)

    set({ keycaps: nextKeycaps })
    get().emitVisualEvent(path, null, nextKeycaps)
  },

  updateModules: (params) => {
    const state = get()
    const prevSnapshot = pickSnapshot(state)
    const nextModules = mergeModulesConfig(state.modules, params)
    const nextSnapshot: KeyboardSnapshot = { ...prevSnapshot, modules: nextModules }

    set({ modules: nextModules })
    applyDomainUpdate(MODULE_PARAMETER_PATHS, prevSnapshot, nextSnapshot, get().emitVisualEvent)
  },

  updateDeskSetup: (params) => {
    const state = get()
    const prevSnapshot = pickSnapshot(state)
    const nextDeskSetup = mergeDeskSetupConfig(state.deskSetup, params)
    const nextSnapshot: KeyboardSnapshot = { ...prevSnapshot, deskSetup: nextDeskSetup }

    set({ deskSetup: nextDeskSetup })
    applyDomainUpdate(DESK_SETUP_PARAMETER_PATHS, prevSnapshot, nextSnapshot, get().emitVisualEvent)
  },

  updateAcousticOverrides: (params) => {
    const state = get()
    const prevSnapshot = pickSnapshot(state)
    const nextAcoustic = mergeAcousticOverrides(state.acousticOverrides, params)
    const nextSnapshot: KeyboardSnapshot = { ...prevSnapshot, acousticOverrides: nextAcoustic }

    set({ acousticOverrides: nextAcoustic })
    applyDomainUpdate(ACOUSTIC_PARAMETER_PATHS, prevSnapshot, nextSnapshot, get().emitVisualEvent)
  },

  updateEnvironment: (params) => {
    const nextDesk: Partial<DeskSetupConfig> = {}
    const nextModules: Partial<ModulesConfig> = {}

    if (params.deskmat || params.deskmatColor || params.cable) {
      nextDesk.deskmat = params.deskmat
      nextDesk.deskmatColor = params.deskmatColor
      nextDesk.cable = params.cable
    }

    if (params.rgbEnabled !== undefined || params.rgbMode || params.rgbColor) {
      nextModules.lighting = {
        enabled: params.rgbEnabled ?? get().modules.lighting.enabled,
        mode: params.rgbMode ?? get().modules.lighting.mode,
        color: params.rgbColor ?? get().modules.lighting.color,
        reactiveSpread: get().modules.lighting.reactiveSpread,
      }
    }

    if (params.oled) {
      nextModules.oled = {
        enabled: params.oled.enabled,
        display: params.oled.display,
        position: get().modules.oled.position,
      }
    }

    if (Object.keys(nextDesk).length > 0) {
      get().updateDeskSetup(nextDesk)
    }
    if (Object.keys(nextModules).length > 0) {
      get().updateModules(nextModules)
    }

    get().emitSummaryEvent('兼容映射', 'environment 参数已迁移到 modules/deskSetup', 'DEPRECATED')
  },

  setActiveKey: (key) =>
    set({
      activeKey: key,
      activeKeys: key ? [key] : [],
    }),

  setKeyPressed: (keyId, pressed) =>
    set((state) => {
      const nextKeys = new Set(state.activeKeys)
      if (pressed) {
        nextKeys.add(keyId)
      } else {
        nextKeys.delete(keyId)
      }

      const activeKeys = Array.from(nextKeys)
      return {
        activeKeys,
        activeKey: activeKeys.length > 0 ? activeKeys[activeKeys.length - 1] : null,
      }
    }),

  toggleTypingTest: () =>
    set((state) => ({
      typingTest: {
        ...state.typingTest,
        enabled: !state.typingTest.enabled,
      },
    })),

  updateTypingStats: (wpm, accuracy) =>
    set({
      typingTest: {
        enabled: get().typingTest.enabled,
        wpm,
        accuracy,
      },
    }),

  updateRenderVisibility: (params) =>
    set((state) => ({
      renderVisibility: mergeRenderVisibility(state.renderVisibility, params),
    })),

  toggleHideKeycaps: () =>
    set((state) => ({
      renderVisibility: {
        ...state.renderVisibility,
        hideKeycaps: !state.renderVisibility.hideKeycaps,
      },
    })),

  toggleHideSwitches: () =>
    set((state) => ({
      renderVisibility: {
        ...state.renderVisibility,
        hideSwitches: !state.renderVisibility.hideSwitches,
      },
    })),

  resetToDefaults: () => {
    set({
      layout: DEFAULT_LAYOUT,
      case: DEFAULT_CASE,
      internals: DEFAULT_INTERNALS,
      switches: DEFAULT_SWITCHES,
      keycaps: DEFAULT_KEYCAPS,
      modules: DEFAULT_MODULES,
      deskSetup: DEFAULT_DESK_SETUP,
      acousticOverrides: DEFAULT_ACOUSTIC_OVERRIDES,
      activeKeys: [...DEFAULT_RUNTIME_STATE.activeKeys],
      activeKey: DEFAULT_RUNTIME_STATE.activeKey,
      typingTest: { ...DEFAULT_RUNTIME_STATE.typingTest },
      renderVisibility: { ...DEFAULT_RUNTIME_STATE.renderVisibility },
      lastVisualEvent: DEFAULT_RUNTIME_STATE.lastVisualEvent,
    })
    get().emitSummaryEvent('配置已重置', '所有参数已恢复默认值', 'DEFAULT')
  },

  exportBuild: () => {
    const state = get()
    const encoded = encodeBuildCodeV3({
      layout: state.layout,
      case: state.case,
      internals: state.internals,
      switches: state.switches,
      keycaps: state.keycaps,
      modules: state.modules,
      deskSetup: state.deskSetup,
      acousticOverrides: state.acousticOverrides,
    })
    if (!encoded) {
      get().emitSummaryEvent('导出失败', 'Build Code 编码失败，请重试', '')
      return ''
    }
    return encoded
  },

  importBuild: (code) => {
    const decoded = decodeBuildCode(code)
    if (!decoded.ok) {
      if (decoded.error === 'unsupported_version') {
        get().emitSummaryEvent('导入失败', '仅支持 v2 / v3 配置格式', String(decoded.rawVersion))
        return
      }
      get().emitSummaryEvent('导入失败', 'Build Code 解析失败，请检查内容', '')
      return
    }

    const { payload, version } = decoded
    const legacyLayoutForm = readEnum(readLegacyLayoutFormFactor(payload), LAYOUT_TYPES, DEFAULT_LAYOUT.formFactor)

    const nextLayout =
      version === 3
        ? normalizeLayoutConfig(payload.l)
        : normalizeLayoutConfig({
          formFactor: legacyLayoutForm,
          standard: DEFAULT_LAYOUT.standard,
          variant: DEFAULT_LAYOUT.variant,
          specialStructure: DEFAULT_LAYOUT.specialStructure,
        })

    const nextCase = normalizeCaseConfig(payload.c)
    const nextInternals = normalizeInternalsConfig(payload.i)
    const nextSwitches = normalizeSwitchConfig(payload.s)
    const nextKeycaps = normalizeKeycapConfig(payload.k)

    let nextModules = normalizeModulesConfig(payload.m)
    let nextDeskSetup = normalizeDeskSetupConfig(payload.d)
    let migrationCount = 0

    if (version === 2) {
      const migrated = migrateEnvironmentToV3(payload.e)
      nextModules = mergeModulesConfig(nextModules, migrated.modules)
      nextDeskSetup = mergeDeskSetupConfig(nextDeskSetup, migrated.deskSetup)
      migrationCount = migrated.mappedCount
    }

    const nextAcoustic = normalizeAcousticOverrides(payload.ao)

    set({
      layout: nextLayout,
      case: nextCase,
      internals: nextInternals,
      switches: nextSwitches,
      keycaps: nextKeycaps,
      modules: nextModules,
      deskSetup: nextDeskSetup,
      acousticOverrides: nextAcoustic,
      activeKeys: [...DEFAULT_RUNTIME_STATE.activeKeys],
      activeKey: DEFAULT_RUNTIME_STATE.activeKey,
      renderVisibility: { ...DEFAULT_RUNTIME_STATE.renderVisibility },
    })

    if (version === 2) {
      get().emitSummaryEvent('配置已导入', `v2 已迁移到 v3，自动映射 ${migrationCount} 项`, 'v2->v3')
      return
    }

    get().emitSummaryEvent('配置已导入', '参数已应用，渲染反馈已同步', 'v3')
  },
}))

export { useKeyboardStore }
export default useKeyboardStore
