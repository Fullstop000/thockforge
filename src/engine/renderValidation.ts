import { InternalsConfig, KeycapConfig, KeycapZone, SwitchConfig } from '@/types/keyboard'
import { deriveRenderParams } from '@/engine/deriveRenderParams'

/**
 * 单项渲染校验问题。
 */
export interface RenderValidationIssue {
  /** 问题编码，便于后续分类统计。 */
  code: string
  /** 问题描述。 */
  message: string
  /** 触发问题的 keyId（如果存在）。 */
  keyId?: string
}

/**
 * 渲染自检报告。
 */
export interface RenderValidationReport {
  /** 是否通过所有校验项。 */
  passed: boolean
  /** 已检查样本键数量。 */
  checkedKeys: number
  /** 命中的问题列表。 */
  issues: RenderValidationIssue[]
}

type ValidationInput = {
  keycaps: KeycapConfig
  switches: SwitchConfig
  internals: Pick<InternalsConfig, 'mods'>
}

type SampleKey = {
  id: string
  zone: KeycapZone
  row: number
  width: number
  depth: number
}

const SAMPLE_KEYS: SampleKey[] = [
  { id: 'esc', zone: 'function', row: 0, width: 1, depth: 1 },
  { id: 'q', zone: 'alpha', row: 2, width: 1, depth: 1 },
  { id: 'enter', zone: 'modifier', row: 3, width: 2.25, depth: 1 },
  { id: 'space', zone: 'space', row: 5, width: 6.25, depth: 1 },
]

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value) && !Number.isNaN(value)
}

/**
 * 运行结构与动画参数的快速自检。
 * 该函数用于开发态快速判断“当前配置是否明显越界”，不是视觉截图替代方案。
 */
export function runRenderValidation(input: ValidationInput): RenderValidationReport {
  const issues: RenderValidationIssue[] = []

  SAMPLE_KEYS.forEach((sample) => {
    const derived = deriveRenderParams(
      {
        keycaps: input.keycaps,
        switches: input.switches,
        internals: input.internals,
      },
      {
        zone: sample.zone,
        keyId: sample.id,
        row: sample.row,
        width: sample.width,
        depth: sample.depth,
      }
    )

    const valuesToCheck = [
      derived.keycap.keyHeight,
      derived.keycap.topDishDepth,
      derived.switches.baseTravel,
      derived.switches.switchTopY,
      derived.switches.switchBottomY,
      derived.switches.stemBaseY,
      derived.keycapMount.socketDepth,
      derived.keycapMount.socketCrossSlot,
      derived.switchStructure.stemCrossSlot,
      derived.keycapMount.lateralJitterLimit,
    ]

    if (!valuesToCheck.every(isFiniteNumber)) {
      issues.push({
        code: 'non_finite_value',
        keyId: sample.id,
        message: '存在 NaN/Inf 参数，可能导致动画或渲染异常。',
      })
    }

    if (derived.switches.switchBottomY >= derived.switches.switchTopY) {
      issues.push({
        code: 'switch_housing_order_invalid',
        keyId: sample.id,
        message: '轴体上下壳基准高度关系错误（bottomY 应低于 topY）。',
      })
    }

    if (derived.switches.baseTravel <= 0) {
      issues.push({
        code: 'travel_non_positive',
        keyId: sample.id,
        message: '轴体行程非正值，按键无法稳定下压/回弹。',
      })
    }

    if (derived.keycapMount.socketCrossSlot <= derived.switchStructure.stemCrossSlot) {
      issues.push({
        code: 'socket_stem_interference',
        keyId: sample.id,
        message: '键帽 socket 十字槽小于 stem 十字臂槽宽，存在装配干涉风险。',
      })
    }

    if (derived.keycapMount.lateralJitterLimit < 0 || derived.keycapMount.lateralJitterLimit > 0.0003) {
      issues.push({
        code: 'jitter_limit_out_of_range',
        keyId: sample.id,
        message: '横向抖动限幅超出安全区间，可能导致视觉漂移或穿插。',
      })
    }

    const maxTravelByCase = -(derived.assemblyLite.caseInnerFloorY + 0.0002) - derived.keycap.keyHeight * 0.5
    if (maxTravelByCase <= 0) {
      issues.push({
        code: 'case_travel_limit_invalid',
        keyId: sample.id,
        message: '机壳行程上限无效，键帽可能被底盘错误阻挡。',
      })
    }
  })

  return {
    passed: issues.length === 0,
    checkedKeys: SAMPLE_KEYS.length,
    issues,
  }
}

export default runRenderValidation
