import {
  AcousticOverrides,
  CaseConfig,
  CableType,
  DEFAULT_DESK_SETUP,
  DEFAULT_MODULES,
  DeskSetupConfig,
  DeskmatType,
  InternalsConfig,
  KeycapConfig,
  LayoutConfig,
  ModulesConfig,
  SwitchConfig,
} from '@/types/keyboard'

type UnknownRecord = Record<string, unknown>

const DESKMAT_TYPES: DeskmatType[] = ['none', 'cloth', 'glass', 'leather', 'wood']
const CABLE_TYPES: CableType[] = ['aviator', 'lemo', 'coiled_usb', 'straight_usb']
const LIGHTING_MODES: Array<ModulesConfig['lighting']['mode']> = ['static', 'wave', 'reactive', 'rainbow']
const OLED_DISPLAYS: Array<ModulesConfig['oled']['display']> = ['wpm', 'time', 'gif', 'custom']

/**
 * v3 Build Code 的最小可序列化快照。
 * 只包含需要跨会话/分享恢复的持久化配置域。
 */
export interface BuildSnapshotV3 {
  layout: LayoutConfig
  case: CaseConfig
  internals: InternalsConfig
  switches: SwitchConfig
  keycaps: KeycapConfig
  modules: ModulesConfig
  deskSetup: DeskSetupConfig
  acousticOverrides: AcousticOverrides
}

/**
 * v2 environment 迁移结果：将旧域映射到新域并统计映射项数量。
 */
export interface EnvironmentMigrationResult {
  modules: Partial<ModulesConfig>
  deskSetup: Partial<DeskSetupConfig>
  mappedCount: number
}

/**
 * Build Code 解析结果：成功时返回 payload+version，失败时返回错误码。
 */
export type BuildCodeDecodeResult =
  | { ok: true; payload: UnknownRecord; version: 2 | 3 }
  | { ok: false; error: 'decode_failed' }
  | { ok: false; error: 'unsupported_version'; rawVersion: unknown }

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

function readColor(value: unknown, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback
  }

  const candidate = value.trim()
  return /^#[0-9a-fA-F]{6}$/.test(candidate) ? candidate : fallback
}

function decodeBuildPayload(code: string): UnknownRecord | null {
  try {
    const parsed = JSON.parse(atob(code))
    return isRecord(parsed) ? parsed : null
  } catch {
    return null
  }
}

/**
 * 序列化 v3 Build Code。
 * 返回 null 代表编码失败（例如意外序列化错误），由调用层决定提示文案。
 */
export function encodeBuildCodeV3(snapshot: BuildSnapshotV3): string | null {
  try {
    return btoa(
      JSON.stringify({
        v: 3,
        l: snapshot.layout,
        c: snapshot.case,
        i: snapshot.internals,
        s: snapshot.switches,
        k: snapshot.keycaps,
        m: snapshot.modules,
        d: snapshot.deskSetup,
        ao: snapshot.acousticOverrides,
      })
    )
  } catch {
    return null
  }
}

/**
 * 解析 Build Code 并做版本门禁校验。
 * - 默认缺省版本按 v2 兼容路径处理。
 * - 仅允许 v2 / v3。
 */
export function decodeBuildCode(code: string): BuildCodeDecodeResult {
  const payload = decodeBuildPayload(code)
  if (!payload) {
    return { ok: false, error: 'decode_failed' }
  }

  const rawVersion = payload.v
  const version = typeof rawVersion === 'number' ? rawVersion : 2

  if (version !== 2 && version !== 3) {
    return { ok: false, error: 'unsupported_version', rawVersion }
  }

  return { ok: true, payload, version }
}

/**
 * 读取 v2 payload 中旧的 case.layout 字段（仅迁移期使用）。
 */
export function readLegacyLayoutFormFactor(payload: UnknownRecord): unknown {
  const legacyCaseSource = isRecord(payload.c) ? payload.c : {}
  return legacyCaseSource.layout
}

/**
 * v2 `environment` -> v3 `modules + deskSetup` 迁移适配器。
 */
export function migrateEnvironmentToV3(input: unknown): EnvironmentMigrationResult {
  const source = isRecord(input) ? input : {}
  const cable = isRecord(source.cable) ? source.cable : {}
  const oled = isRecord(source.oled) ? source.oled : {}

  const deskSetup: Partial<DeskSetupConfig> = {
    deskmat: readEnum(source.deskmat, DESKMAT_TYPES, DEFAULT_DESK_SETUP.deskmat),
    deskmatColor: readColor(source.deskmatColor, DEFAULT_DESK_SETUP.deskmatColor),
    cable: {
      enabled: readBoolean(cable.enabled, DEFAULT_DESK_SETUP.cable.enabled),
      type: readEnum(cable.type, CABLE_TYPES, DEFAULT_DESK_SETUP.cable.type),
      color: readColor(cable.color, DEFAULT_DESK_SETUP.cable.color),
    },
  }

  const modules: Partial<ModulesConfig> = {
    lighting: {
      enabled: readBoolean(source.rgbEnabled, DEFAULT_MODULES.lighting.enabled),
      mode: readEnum(source.rgbMode, LIGHTING_MODES, DEFAULT_MODULES.lighting.mode),
      color: readColor(source.rgbColor, DEFAULT_MODULES.lighting.color),
      reactiveSpread: DEFAULT_MODULES.lighting.reactiveSpread,
    },
    oled: {
      enabled: readBoolean(oled.enabled, DEFAULT_MODULES.oled.enabled),
      display: readEnum(oled.display, OLED_DISPLAYS, DEFAULT_MODULES.oled.display),
      position: DEFAULT_MODULES.oled.position,
    },
  }

  return {
    modules,
    deskSetup,
    mappedCount: 10,
  }
}
