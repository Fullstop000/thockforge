import {
  AcousticOverrides,
  CaseConfig,
  DeskSetupConfig,
  EnvironmentConfig,
  InternalsConfig,
  KeyboardConfig,
  KeycapConfig,
  KeycapZone,
  KeycapZoneConfig,
  LayoutConfig,
  ModulesConfig,
  SwitchConfig,
} from './keyboardConfig'
import { ParameterPath } from './keyboardFeedback'
import { KeyboardRuntimeState, RenderVisibilityState } from './keyboardRuntime'

/**
 * Zustand Store 总契约：持久化配置 + 运行态 + 动作方法。
 */
export interface KeyboardStoreState extends KeyboardConfig, KeyboardRuntimeState {
  /** 更新配列域配置（支持部分字段更新）。 */
  updateLayout: (params: Partial<LayoutConfig>) => void
  /** 更新外壳域配置（支持部分字段更新）。 */
  updateCase: (params: Partial<CaseConfig>) => void
  /** 更新内胆域配置（支持部分字段更新）。 */
  updateInternals: (params: Partial<InternalsConfig>) => void
  /** 更新轴体域配置（支持部分字段更新）。 */
  updateSwitches: (params: Partial<SwitchConfig>) => void
  /** 更新键帽域配置（支持部分字段更新）。 */
  updateKeycaps: (params: {
    zones?: Partial<Record<KeycapZone, Partial<KeycapZoneConfig>>>
    overrides?: Record<string, Partial<KeycapZoneConfig>>
    artisan?: Partial<KeycapConfig['artisan']>
  }) => void
  /** 更新模块域配置（支持部分字段更新）。 */
  updateModules: (params: Partial<ModulesConfig>) => void
  /** 更新桌面域配置（支持部分字段更新）。 */
  updateDeskSetup: (params: Partial<DeskSetupConfig>) => void
  /** 更新声学覆盖参数。 */
  updateAcousticOverrides: (params: Partial<AcousticOverrides>) => void

  /**
   * @deprecated 仅用于旧 UI 兼容。
   * 新代码请改用 `updateModules` + `updateDeskSetup`。
   */
  updateEnvironment: (params: Partial<EnvironmentConfig>) => void

  /**
   * @deprecated 单键写入接口。
   * 新逻辑请使用 `setKeyPressed` 维护多键状态。
   */
  setActiveKey: (key: string | null) => void
  /** 设置某个键位的按下/抬起状态（支持多键并发）。 */
  setKeyPressed: (keyId: string, pressed: boolean) => void
  /** 切换打字测试开关。 */
  toggleTypingTest: () => void
  /** 更新打字测试统计值。 */
  updateTypingStats: (wpm: number, accuracy: number) => void
  /** 更新场景可见性（透明化显隐）。 */
  updateRenderVisibility: (params: Partial<RenderVisibilityState>) => void
  /** 切换键帽显隐（通过透明化）。 */
  toggleHideKeycaps: () => void
  /** 切换轴体显隐（通过透明化）。 */
  toggleHideSwitches: () => void

  /** 触发单参数可视反馈事件。 */
  emitVisualEvent: (path: ParameterPath, oldValue: unknown, newValue: unknown) => void
  /** 触发摘要型反馈事件（如导入成功、重置完成）。 */
  emitSummaryEvent: (label: string, effect: string, value?: string) => void

  /** 重置为默认配置与默认运行态。 */
  resetToDefaults: () => void
  /** 导出 Build Code 字符串。 */
  exportBuild: () => string
  /** 导入 Build Code 并做安全归一化处理。 */
  importBuild: (code: string) => void
}

/**
 * 兼容旧命名：历史代码仍可使用 `KeyboardState`。
 */
export type KeyboardState = KeyboardStoreState
