import { SwitchType } from '@/types/keyboard'
import { clamp } from '@/components/3d/materials/pbrPresets'
import { DerivedAnimationParams, DerivedSwitchRenderParams } from './deriveRenderParams'

/**
 * 按键运动状态机：
 * - INITIAL: 静止抬起
 * - MOVING_DOWN: 正在按下
 * - PRESSED: 已触底
 * - MOVING_UP: 正在回弹
 */
export type KeyMotionState = 'initial' | 'moving_down' | 'pressed' | 'moving_up'

interface KeyAnimationState {
  pressed: boolean
  motion: KeyMotionState
  queueRelease: boolean
  travel: number
  velocity: number
  tiltX: number
  tiltZ: number
  lateralJitter: number
  clock: number
  impactSeed: number
}

const MAX_LINEAR_SPEED = 0.18
const MIN_LINEAR_SPEED = 0.03
const MAX_TILT_X = 0.06
const MAX_TILT_Z = 0.045

export interface KeyAnimationSample {
  /** 当前位移（m）。 */
  travel: number
  /** 位移归一化比例（0~1）。 */
  pressRatio: number
  /** X 轴倾角（rad）。 */
  tiltX: number
  /** Z 轴倾角（rad）。 */
  tiltZ: number
  /** 横向抖动偏移（m）。 */
  lateralJitter: number
}

export interface KeyAnimationInput {
  /** 帧间隔时间（秒）。 */
  delta: number
  /** 键位 ID。 */
  keyId: string
  /** 轴体类型。 */
  switchType: SwitchType
  /** 轴体推导参数。 */
  switchParams: Pick<
    DerivedSwitchRenderParams,
    'baseTravel' | 'preTravelMm' | 'springStiffness' | 'springDamping' | 'bumpCenter' | 'bumpWidth' | 'bumpStrength'
  >
  /** 动画推导参数。 */
  animationParams: DerivedAnimationParams
  /** 卫星轴抖动幅度。 */
  stabilizerAmplitude: number
  /** Profile 倾角（rad）。 */
  profileAngle: number
}

/**
 * 按键动画调度器。
 * 设计目标：
 * 1. 位移主导（仅 Y 轴行程）。
 * 2. 旋转仅作为从属微扰，不参与主动力学。
 * 3. 使用状态机避免连续积分发散。
 */
export class KeyAnimationScheduler {
  private readonly states = new Map<string, KeyAnimationState>()

  /**
   * 生成稳定且可复现的 0~1 哈希值，用于按键个体差异扰动。
   */
  private hashSeed(id: string): number {
    let hash = 2166136261
    for (let i = 0; i < id.length; i += 1) {
      hash ^= id.charCodeAt(i)
      hash = Math.imul(hash, 16777619)
    }
    return (hash >>> 0) / 4294967295
  }

  /**
   * 基础状态兜底，防止非法值污染后续采样。
   */
  private sanitizeState(state: KeyAnimationState) {
    if (!Number.isFinite(state.travel)) state.travel = 0
    if (!Number.isFinite(state.velocity)) state.velocity = 0
    if (!Number.isFinite(state.tiltX)) state.tiltX = 0
    if (!Number.isFinite(state.tiltZ)) state.tiltZ = 0
    if (!Number.isFinite(state.lateralJitter)) state.lateralJitter = 0
    if (!Number.isFinite(state.clock)) state.clock = 0
  }

  /**
   * 根据当前轴体参数估算按下/回弹速度。
   * 这里输出的是受限速度，保证状态机运动稳定。
   */
  private resolveLinearSpeeds(input: KeyAnimationInput, travelLimit: number) {
    const stiffnessRatio = clamp(input.switchParams.springStiffness / 220, 0.72, 1.45)
    const bumpRatio = clamp(input.switchParams.bumpStrength, 0, 1)

    const downDuration = clamp(0.05 - (stiffnessRatio - 1) * 0.012 + bumpRatio * 0.007, 0.028, 0.062)
    const upDuration = clamp(0.043 - (stiffnessRatio - 1) * 0.01, 0.024, 0.056)

    const downSpeed = clamp(travelLimit / downDuration, MIN_LINEAR_SPEED, MAX_LINEAR_SPEED)
    const upSpeed = clamp(travelLimit / upDuration, MIN_LINEAR_SPEED, MAX_LINEAR_SPEED)

    return {
      downSpeed,
      upSpeed,
    }
  }

  /**
   * 兼容接口：返回指定键位当前样本。
   * `t` 当前仅保留为时间占位参数，便于后续扩展采样策略。
   */
  sample(id: string, t: number): KeyAnimationSample
  sample(input: KeyAnimationInput): KeyAnimationSample
  sample(idOrInput: string | KeyAnimationInput, t?: number): KeyAnimationSample {
    if (typeof idOrInput === 'string') {
      const state = this.states.get(idOrInput)
      if (!state) {
        return {
          travel: 0,
          pressRatio: 0,
          tiltX: 0,
          tiltZ: 0,
          lateralJitter: 0,
        }
      }

      const baselineTravel = Math.max(0.0001, t ?? 0.004)
      const pressRatio = clamp(state.travel / baselineTravel, 0, 1)
      return {
        travel: state.travel,
        pressRatio,
        tiltX: state.tiltX,
        tiltZ: state.tiltZ,
        lateralJitter: state.lateralJitter,
      }
    }

    return this.sampleWithInput(idOrInput)
  }

  /**
   * 注册键位状态。
   */
  registerKey(id: string) {
    if (this.states.has(id)) {
      return
    }

    this.states.set(id, {
      pressed: false,
      motion: 'initial',
      queueRelease: false,
      travel: 0,
      velocity: 0,
      tiltX: 0,
      tiltZ: 0,
      lateralJitter: 0,
      clock: 0,
      impactSeed: this.hashSeed(id),
    })
  }

  /**
   * 移除键位状态，防止动态布局切换后状态泄漏。
   */
  unregisterKey(id: string) {
    this.states.delete(id)
  }

  /**
   * 设置按下/抬起状态。
   * 采用 keysim 风格队列语义：若按下途中收到抬起，会在触底后立即回弹。
   */
  setPressed(id: string, pressed: boolean) {
    this.registerKey(id)
    const state = this.states.get(id)
    if (!state || state.pressed === pressed) {
      return
    }

    state.pressed = pressed

    if (pressed) {
      state.queueRelease = false
      if (state.motion === 'initial' || state.motion === 'moving_up') {
        state.motion = 'moving_down'
      }
      return
    }

    if (state.motion === 'moving_down') {
      state.queueRelease = true
      return
    }

    if (state.motion === 'pressed') {
      state.motion = 'moving_up'
      return
    }

    if (state.motion !== 'initial') {
      state.motion = 'moving_up'
    }
  }

  /**
   * 通过完整输入采样当前键位。
   */
  private sampleWithInput(input: KeyAnimationInput): KeyAnimationSample {
    this.registerKey(input.keyId)
    const state = this.states.get(input.keyId)
    if (!state) {
      return {
        travel: 0,
        pressRatio: 0,
        tiltX: input.animationParams.rowCurveBias,
        tiltZ: 0,
        lateralJitter: 0,
      }
    }

    const dt = Math.min(input.delta, 1 / 30)
    const travelLimit = Math.max(input.switchParams.baseTravel, 0.0001)
    const previousTravel = state.travel

    state.clock += dt
    this.sanitizeState(state)

    if (state.pressed && (state.motion === 'initial' || state.motion === 'moving_up')) {
      state.motion = 'moving_down'
      state.queueRelease = false
    }

    if (!state.pressed && state.motion === 'pressed') {
      state.motion = 'moving_up'
    }

    const speeds = this.resolveLinearSpeeds(input, travelLimit)

    if (state.motion === 'moving_down') {
      let stepDown = speeds.downSpeed * dt

      if ((input.switchType === 'tactile' || input.switchType === 'clicky') && input.switchParams.bumpStrength > 0) {
        const distance = Math.abs(state.travel - input.switchParams.bumpCenter)
        if (distance < input.switchParams.bumpWidth) {
          const bumpRatio = 1 - distance / Math.max(input.switchParams.bumpWidth, 0.0001)
          stepDown *= 1 - bumpRatio * clamp(input.switchParams.bumpStrength, 0, 1) * 0.4
        }
      }

      state.travel += stepDown

      if (state.travel >= travelLimit) {
        state.travel = travelLimit

        if (state.queueRelease || !state.pressed) {
          state.motion = 'moving_up'
          state.queueRelease = false
        } else {
          state.motion = 'pressed'
        }
      }
    } else if (state.motion === 'moving_up') {
      let stepUp = speeds.upSpeed * dt
      if (state.travel > travelLimit * 0.8) {
        stepUp *= 1.14
      }
      state.travel -= stepUp

      if (state.travel <= 0) {
        state.travel = 0
        state.queueRelease = false
        state.motion = state.pressed ? 'moving_down' : 'initial'
      }
    } else if (state.motion === 'pressed') {
      state.travel = travelLimit
    } else {
      state.travel = 0
    }

    state.travel = clamp(state.travel, 0, travelLimit)
    state.velocity = (state.travel - previousTravel) / Math.max(dt, 0.0001)

    const pressRatio = clamp(state.travel / travelLimit, 0, 1)

    const jitterTarget =
      input.stabilizerAmplitude > 0 && state.motion !== 'initial'
        ? Math.sin(state.clock * (24 + state.impactSeed * 6) + state.impactSeed * 4.4) *
          input.stabilizerAmplitude *
          0.22 *
          (0.35 + pressRatio * 0.65)
        : 0

    state.lateralJitter += (jitterTarget - state.lateralJitter) * Math.min(1, dt * (state.motion === 'moving_up' ? 28 : 18))

    // 旋转从属微扰：只随 pressRatio 和 jitter 轻微变化，不参与主位移动力学。
    const baseTiltX = input.animationParams.rowCurveBias - input.profileAngle * 0.08
    const pressTiltX = -pressRatio * Math.min(0.018, input.animationParams.pressTiltFactor * 0.26)
    const impulseTiltX =
      state.motion === 'moving_down'
        ? -0.004 * (0.4 + state.impactSeed * 0.6) * (1 - pressRatio)
        : state.motion === 'moving_up'
          ? 0.003 * (0.2 + state.impactSeed * 0.5) * (1 - pressRatio)
          : 0

    const targetTiltX = baseTiltX + pressTiltX + impulseTiltX
    const targetTiltZ = state.lateralJitter * Math.min(18, input.animationParams.jitterTiltFactor * 0.08)

    state.tiltX += (targetTiltX - state.tiltX) * Math.min(1, dt * 18)
    state.tiltZ += (targetTiltZ - state.tiltZ) * Math.min(1, dt * 16)

    state.tiltX = clamp(state.tiltX, -MAX_TILT_X, MAX_TILT_X)
    state.tiltZ = clamp(state.tiltZ, -MAX_TILT_Z, MAX_TILT_Z)

    if (!state.pressed && state.motion === 'initial') {
      const restTiltX = input.animationParams.rowCurveBias - input.profileAngle * 0.08
      state.tiltX += (restTiltX - state.tiltX) * Math.min(1, dt * 22)
      if (Math.abs(state.lateralJitter) <= input.animationParams.travelEpsilon) {
        state.lateralJitter = 0
      }
      if (Math.abs(state.tiltZ) <= input.animationParams.travelEpsilon) {
        state.tiltZ = 0
      }
    }

    this.sanitizeState(state)

    return {
      travel: state.travel,
      pressRatio,
      tiltX: state.tiltX,
      tiltZ: state.tiltZ,
      lateralJitter: state.lateralJitter,
    }
  }
}

/**
 * 全局键位动画调度器实例。
 */
export const keyAnimationScheduler = new KeyAnimationScheduler()
