import { VisualFeedbackEvent } from './keyboardFeedback'

/**
 * 打字测试运行指标（仅运行态，不参与导出配置）。
 */
export interface TypingTestState {
  /** 是否启用打字测试模式。 */
  enabled: boolean
  /** 当前每分钟字数（Words Per Minute）。 */
  wpm: number
  /** 当前正确率（百分比数值）。 */
  accuracy: number
}

/**
 * 场景可见性开关（运行态，不参与持久化）。
 * 通过透明化控制结构件显隐，便于装配关系检查。
 */
export interface RenderVisibilityState {
  /** 是否透明化移除全部键帽。 */
  hideKeycaps: boolean
  /** 是否透明化移除全部轴体。 */
  hideSwitches: boolean
}

/**
 * 键盘运行态：临时交互状态，不写入 Build Code。
 */
export interface KeyboardRuntimeState {
  /** 当前按下的键位 ID 集合（支持多键并发）。 */
  activeKeys: string[]
  /**
   * @deprecated 旧字段，仅用于兼容历史实现。
   * 新逻辑请使用 `activeKeys`。
   */
  /** 当前按下的键位 ID。 */
  activeKey: string | null
  /** 打字测试统计状态。 */
  typingTest: TypingTestState
  /** 场景可见性调试状态。 */
  renderVisibility: RenderVisibilityState
  /** 最近一次可视反馈事件。 */
  lastVisualEvent: VisualFeedbackEvent | null
}

/**
 * 默认打字测试运行指标。
 */
export const DEFAULT_TYPING_TEST: TypingTestState = {
  enabled: false,
  wpm: 0,
  accuracy: 100,
}

/**
 * 默认场景可见性状态。
 */
export const DEFAULT_RENDER_VISIBILITY: RenderVisibilityState = {
  hideKeycaps: false,
  hideSwitches: false,
}

/**
 * 默认运行态（仅包含临时字段）。
 */
export const DEFAULT_RUNTIME_STATE: KeyboardRuntimeState = {
  activeKeys: [],
  activeKey: null,
  typingTest: DEFAULT_TYPING_TEST,
  renderVisibility: DEFAULT_RENDER_VISIBILITY,
  lastVisualEvent: null,
}
