/**
 * 键盘类型总入口（兼容历史 import）。
 * 新代码建议按领域按需导入：
 * - `keyboardConfig.ts`（持久化配置）
 * - `keyboardRuntime.ts`（运行态）
 * - `keyboardFeedback.ts`（反馈事件）
 * - `keyboardStore.ts`（Store 契约）
 */

export * from './keyboardConfig'
export * from './keyboardFeedback'
export * from './keyboardRuntime'
export * from './keyboardStore'
