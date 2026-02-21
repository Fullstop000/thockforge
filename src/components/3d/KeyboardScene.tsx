'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Float, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { KeyboardCase } from './KeyboardCase'
import { InternalsPreview } from './InternalsPreview'
import { Keycap } from './Keycap'
import { OledPanel } from './OledPanel'
import { KeycapZone, ModulesConfig } from '@/types/keyboard'
import { useKeyboardStore } from '@/store/useKeyboardStore'
import { KeyDefinition, resolveLayoutDefinition } from '@/data/layouts'
import { audioEngine } from '@/audio/AudioEngine'
import { DEFAULT_RENDER_QUALITY, RENDER_GEOMETRY_BUDGETS, RenderQualityTier } from '@/types/renderingModel'

const UNIT_SIZE = 0.01905
const KEY_HEIGHT = 0.015
const CASE_WALL_THICKNESS = 0.008

const KEYBOARD_CODE_TO_KEY_ID: Record<string, string> = {
  Escape: 'esc',
  Backquote: 'grave',
  Minus: 'minus',
  Equal: 'equal',
  Backspace: 'backspace',
  Tab: 'tab',
  BracketLeft: 'bracket-l',
  BracketRight: 'bracket-r',
  Backslash: 'backslash',
  CapsLock: 'caps',
  Semicolon: 'semicolon',
  Quote: 'quote',
  Enter: 'enter',
  ShiftLeft: 'lshift',
  ShiftRight: 'rshift',
  Comma: 'comma',
  Period: 'period',
  Slash: 'slash',
  ControlLeft: 'lctrl',
  ControlRight: 'rctrl',
  AltLeft: 'lalt',
  AltRight: 'ralt',
  MetaLeft: 'lwin',
  MetaRight: 'rwin',
  ContextMenu: 'menu',
  Space: 'space',
  Insert: 'ins',
  Delete: 'del',
  Home: 'home',
  End: 'end',
  PageUp: 'pgup',
  PageDown: 'pgdn',
  PrintScreen: 'print',
  ScrollLock: 'scroll',
  Pause: 'pause',
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  NumpadDecimal: 'num.',
  NumpadDivide: 'num/',
  NumpadMultiply: 'num*',
  NumpadSubtract: 'num-',
  NumpadAdd: 'num+',
  NumpadEnter: 'numenter',
}

function mapKeyboardEventToKeyId(event: KeyboardEvent): string | null {
  const byCode = KEYBOARD_CODE_TO_KEY_ID[event.code]
  if (byCode) {
    return byCode
  }

  if (/^Key[A-Z]$/.test(event.code)) {
    return event.code.replace('Key', '').toLowerCase()
  }

  if (/^Digit[0-9]$/.test(event.code)) {
    return event.code.replace('Digit', '')
  }

  if (/^F[1-9]$|^F1[0-2]$/.test(event.code)) {
    return event.code.toLowerCase()
  }

  if (/^Numpad[0-9]$/.test(event.code)) {
    return `num${event.code.replace('Numpad', '')}`
  }

  const fallback = event.key.toLowerCase()
  return fallback.length === 1 ? fallback : null
}

function resolveKeycapZone(key: KeyDefinition): KeycapZone {
  const keyId = key.id.toLowerCase()

  if (keyId.startsWith('f') && /^f\d+$/.test(keyId)) {
    return 'function'
  }

  if (keyId.startsWith('num')) {
    return 'numpad'
  }

  if (keyId === 'space' || keyId.startsWith('space-')) {
    return 'space'
  }

  if (
    keyId === 'up' ||
    keyId === 'down' ||
    keyId === 'left' ||
    keyId === 'right' ||
    keyId === 'home' ||
    keyId === 'end' ||
    keyId === 'ins' ||
    keyId === 'del' ||
    keyId === 'pgup' ||
    keyId === 'pgdn' ||
    keyId === 'print' ||
    keyId === 'scroll' ||
    keyId === 'pause'
  ) {
    return 'nav'
  }

  if (key.color === 'modifier') {
    return 'modifier'
  }

  return 'alpha'
}

/**
 * 将输入键位映射到当前布局中实际存在的 keyId。
 * 例如 Alice 的左右空格会从 `space` 自动路由到 `space-l/space-r`。
 */
function resolveLayoutKeyId(rawKeyId: string, layoutKeySet: Set<string>): string | null {
  let resolvedKeyId = rawKeyId

  if (!layoutKeySet.has(resolvedKeyId) && resolvedKeyId === 'space') {
    if (layoutKeySet.has('space')) {
      resolvedKeyId = 'space'
    } else if (layoutKeySet.has('space-l')) {
      resolvedKeyId = 'space-l'
    } else if (layoutKeySet.has('space-r')) {
      resolvedKeyId = 'space-r'
    }
  }

  return layoutKeySet.has(resolvedKeyId) ? resolvedKeyId : null
}

function Keyboard() {
  const layout = useKeyboardStore((state) => state.layout)
  const caseConfig = useKeyboardStore((state) => state.case)
  const internals = useKeyboardStore((state) => state.internals)
  const switches = useKeyboardStore((state) => state.switches)
  const keycaps = useKeyboardStore((state) => state.keycaps)
  const modules = useKeyboardStore((state) => state.modules)
  const typingTest = useKeyboardStore((state) => state.typingTest)
  const acousticOverrides = useKeyboardStore((state) => state.acousticOverrides)
  const activeKeys = useKeyboardStore((state) => state.activeKeys)
  const renderVisibility = useKeyboardStore((state) => state.renderVisibility)
  const setKeyPressed = useKeyboardStore((state) => state.setKeyPressed)
  const lightingEnabled = useKeyboardStore((state) => state.modules.lighting.enabled)
  const lightingMode = useKeyboardStore((state) => state.modules.lighting.mode)
  const layoutDef = useMemo(
    () => resolveLayoutDefinition(layout.formFactor, layout.standard, layout.variant),
    [layout.formFactor, layout.standard, layout.variant]
  )

  const layoutWidth = layoutDef.width * UNIT_SIZE
  const layoutDepth = layoutDef.depth * UNIT_SIZE

  const outerWidth = layoutWidth + CASE_WALL_THICKNESS * 2
  const outerDepth = layoutDepth + CASE_WALL_THICKNESS * 2

  const layoutKeySet = useMemo(() => new Set(layoutDef.keys.map((key) => key.id)), [layoutDef.keys])
  const activeKeySet = useMemo(() => new Set(activeKeys), [activeKeys])

  const [reactivePulse, setReactivePulse] = useState(0)
  const [internalsPreviewActive, setInternalsPreviewActive] = useState(false)
  const [renderQuality, setRenderQuality] = useState<RenderQualityTier>(DEFAULT_RENDER_QUALITY)

  const pointerReleaseTimers = useRef<Map<string, number>>(new Map())
  const keyboardPressedKeys = useRef<Set<string>>(new Set())
  const internalsPreviewTimer = useRef<number | null>(null)

  const internalsSignature = useMemo(() => JSON.stringify(internals), [internals])

  useEffect(() => {
    setInternalsPreviewActive(true)

    if (internalsPreviewTimer.current) {
      window.clearTimeout(internalsPreviewTimer.current)
    }

    internalsPreviewTimer.current = window.setTimeout(() => {
      setInternalsPreviewActive(false)
    }, 1500)

    return () => {
      if (internalsPreviewTimer.current) {
        window.clearTimeout(internalsPreviewTimer.current)
      }
    }
  }, [internalsSignature])

  /**
   * Drives key visual state and sound for pointer + keyboard input.
   */
  const handleKeyPress = useCallback(
    (keyId: string, source: 'keyboard' | 'pointer' = 'pointer') => {
      const resolvedKeyId = resolveLayoutKeyId(keyId, layoutKeySet)
      if (!resolvedKeyId) {
        return
      }

      if (source === 'keyboard' && keyboardPressedKeys.current.has(resolvedKeyId)) {
        return
      }

      if (source === 'keyboard') {
        keyboardPressedKeys.current.add(resolvedKeyId)
      }

      setKeyPressed(resolvedKeyId, true)
      if (lightingEnabled && lightingMode === 'reactive') {
        setReactivePulse((prev) => prev + 1)
      }

      const profile = audioEngine.calculateAcousticProfile(
        switches,
        internals,
        caseConfig,
        keycaps,
        acousticOverrides,
        resolvedKeyId
      )
      audioEngine.playKeySound(profile, true)

      if (source === 'keyboard') {
        return
      }

      const activeTimer = pointerReleaseTimers.current.get(resolvedKeyId)
      if (activeTimer) {
        window.clearTimeout(activeTimer)
      }

      pointerReleaseTimers.current.set(
        resolvedKeyId,
        window.setTimeout(() => {
          pointerReleaseTimers.current.delete(resolvedKeyId)
          if (!keyboardPressedKeys.current.has(resolvedKeyId)) {
            setKeyPressed(resolvedKeyId, false)
          }
        }, 100)
      )
    },
    [
      acousticOverrides,
      caseConfig,
      internals,
      keycaps,
      layoutKeySet,
      lightingEnabled,
      lightingMode,
      setKeyPressed,
      switches,
    ]
  )

  /**
   * 键盘抬起时释放对应 keyId，并保留鼠标点击短按的独立生命周期。
   */
  const handleKeyRelease = useCallback(
    (keyId: string) => {
      const resolvedKeyId = resolveLayoutKeyId(keyId, layoutKeySet)
      if (!resolvedKeyId) {
        return
      }

      keyboardPressedKeys.current.delete(resolvedKeyId)
      if (!pointerReleaseTimers.current.has(resolvedKeyId)) {
        setKeyPressed(resolvedKeyId, false)
      }
    },
    [layoutKeySet, setKeyPressed]
  )

  useEffect(() => {
    const releaseTimers = pointerReleaseTimers.current
    const pressedKeys = keyboardPressedKeys.current

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return
      }

      const keyId = mapKeyboardEventToKeyId(event)
      if (!keyId) {
        return
      }

      handleKeyPress(keyId, 'keyboard')
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const keyId = mapKeyboardEventToKeyId(event)
      if (!keyId) {
        return
      }

      handleKeyRelease(keyId)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)

      releaseTimers.forEach((timerId) => {
        window.clearTimeout(timerId)
      })

      releaseTimers.clear()
      pressedKeys.clear()
    }
  }, [handleKeyPress, handleKeyRelease])

  return (
    <group position={[0, 0, 0]}>
      <RenderQualityGovernor quality={renderQuality} onQualityChange={setRenderQuality} />

      <KeyboardCase config={caseConfig} layoutWidth={layoutWidth} layoutDepth={layoutDepth} />

      <InternalsPreview config={internals} width={outerWidth} depth={outerDepth} previewActive={internalsPreviewActive} />

      {layoutDef.keys.map((key) => {
        const x = -outerWidth / 2 + CASE_WALL_THICKNESS + key.col * UNIT_SIZE + (key.width * UNIT_SIZE) / 2
        const z = -outerDepth / 2 + CASE_WALL_THICKNESS + key.row * UNIT_SIZE + (key.depth * UNIT_SIZE) / 2

        return (
          <Keycap
            key={key.id}
            id={key.id}
            label={key.label}
            subLabel={key.subLabel}
            width={key.width}
            depth={key.depth}
            row={key.row}
            zone={resolveKeycapZone(key)}
            tone={key.color || 'default'}
            config={keycaps}
            switches={switches}
            mods={internals.mods}
            isActive={activeKeySet.has(key.id)}
            isFlexLinked={internals.plateFlexCuts && activeKeySet.size > 0 && !activeKeySet.has(key.id)}
            quality={renderQuality}
            keycapOpacity={renderVisibility.hideKeycaps ? 0 : 1}
            switchOpacity={renderVisibility.hideSwitches ? 0 : 1}
            onPress={() => handleKeyPress(key.id, 'pointer')}
            position={[x, KEY_HEIGHT, z]}
          />
        )
      })}

      {(layout.specialStructure.hhkbBlockers || layout.variant === 'hhkb') && (
        <HHKBBlockers width={outerWidth} depth={outerDepth} />
      )}

      {modules.lighting.enabled && (
        <RGBUnderglow
          width={outerWidth}
          depth={outerDepth}
          color={modules.lighting.color}
          mode={modules.lighting.mode}
          reactivePulse={reactivePulse}
          spread={modules.lighting.reactiveSpread}
        />
      )}

      <KnobModule modules={modules} caseWidth={outerWidth} caseDepth={outerDepth} />
      <TrackPointModule
        modules={modules}
        caseWidth={outerWidth}
        caseDepth={outerDepth}
        forceVisible={layout.variant === 'thinkpad_style' || layout.specialStructure.trackpointCluster}
        forceCenterCluster={layout.specialStructure.trackpointCluster}
      />

      <OledPanel modules={modules} typingTest={typingTest} caseWidth={outerWidth} caseDepth={outerDepth} />
    </group>
  )
}

/**
 * 渲染质量调度器：
 * 依据 Draw Calls / Triangles / CPU 帧耗时做档位切换。
 * 目标是超预算时优先降级细分，而不是让主场景掉帧。
 */
function RenderQualityGovernor({
  quality,
  onQualityChange,
}: {
  quality: RenderQualityTier
  onQualityChange: (quality: RenderQualityTier) => void
}) {
  const sampleFrames = useRef(0)
  const cpuFrameMsAccum = useRef(0)
  const lastSwitchTime = useRef(0)

  useFrame((state, delta) => {
    sampleFrames.current += 1
    cpuFrameMsAccum.current += delta * 1000

    if (sampleFrames.current < 36) {
      return
    }

    const now = state.clock.elapsedTime
    if (now - lastSwitchTime.current < 1.2) {
      sampleFrames.current = 0
      cpuFrameMsAccum.current = 0
      return
    }

    const budget = RENDER_GEOMETRY_BUDGETS[quality]
    const avgCpuFrameMs = cpuFrameMsAccum.current / sampleFrames.current
    const drawCalls = state.gl.info.render.calls
    const triangles = state.gl.info.render.triangles

    const overBudget =
      avgCpuFrameMs > budget.cpuFrameBudgetMs * 1.05 || drawCalls > budget.maxDrawCalls || triangles > budget.maxTriangles

    const underBudget =
      avgCpuFrameMs < budget.cpuFrameBudgetMs * 0.72 &&
      drawCalls < budget.maxDrawCalls * 0.66 &&
      triangles < budget.maxTriangles * 0.66

    if (overBudget) {
      if (quality === 'high') {
        onQualityChange('balanced')
        lastSwitchTime.current = now
      } else if (quality === 'balanced') {
        onQualityChange('performance')
        lastSwitchTime.current = now
      }
    } else if (underBudget) {
      if (quality === 'performance') {
        onQualityChange('balanced')
        lastSwitchTime.current = now
      } else if (quality === 'balanced') {
        onQualityChange('high')
        lastSwitchTime.current = now
      }
    }

    sampleFrames.current = 0
    cpuFrameMsAccum.current = 0
  })

  return null
}

function HHKBBlockers({ width, depth }: { width: number; depth: number }) {
  return (
    <group position={[0, 0.016, -depth * 0.42]}>
      <mesh position={[width * 0.18, 0, 0]}>
        <boxGeometry args={[0.018, 0.002, 0.01]} />
        <meshStandardMaterial color="#2e3444" roughness={0.72} metalness={0.14} />
      </mesh>
      <mesh position={[-width * 0.18, 0, 0]}>
        <boxGeometry args={[0.018, 0.002, 0.01]} />
        <meshStandardMaterial color="#2e3444" roughness={0.72} metalness={0.14} />
      </mesh>
    </group>
  )
}

function RGBUnderglow({
  width,
  depth,
  color,
  mode,
  reactivePulse,
  spread,
}: {
  width: number
  depth: number
  color: string
  mode: string
  reactivePulse: number
  spread: number
}) {
  const lightRef = useRef<THREE.PointLight>(null)
  const time = useRef(0)
  const reactiveEnergy = useRef(0)

  useEffect(() => {
    if (mode === 'reactive') {
      reactiveEnergy.current = 1
    }
  }, [mode, reactivePulse])

  useFrame((_, delta) => {
    time.current += delta

    if (!lightRef.current) {
      return
    }

    if (mode === 'wave') {
      lightRef.current.position.x = Math.sin(time.current * 2) * width * (0.2 + spread * 0.4)
    } else {
      lightRef.current.position.x = 0
    }

    if (mode === 'rainbow') {
      const hue = (time.current * 0.1) % 1
      lightRef.current.color.setHSL(hue, 1, 0.5)
    } else {
      lightRef.current.color.set(color)
    }

    if (mode === 'reactive') {
      reactiveEnergy.current = Math.max(0, reactiveEnergy.current - delta * (1.8 + (1 - spread)))
      lightRef.current.intensity = 0.2 + reactiveEnergy.current * 1.4
    } else {
      lightRef.current.intensity = 0.5
    }
  })

  return (
    <group position={[0, -0.02, 0]}>
      <pointLight ref={lightRef} color={color} intensity={0.5} distance={0.3} decay={2} />
      <mesh>
        <boxGeometry args={[width, 0.002, depth]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={mode === 'reactive' ? 0.7 : 0.5}
          transparent
          opacity={0.28}
        />
      </mesh>
    </group>
  )
}

function KnobModule({
  modules,
  caseWidth,
  caseDepth,
}: {
  modules: ModulesConfig
  caseWidth: number
  caseDepth: number
}) {
  if (!modules.knob.enabled || modules.knob.count <= 0) {
    return null
  }

  const baseX = modules.knob.position === 'left_edge' ? -caseWidth * 0.42 : caseWidth * 0.42
  const baseZ = modules.knob.position === 'right_edge' ? 0 : -caseDepth * 0.25

  return (
    <group>
      {Array.from({ length: modules.knob.count }).map((_, index) => (
        <group key={index} position={[baseX, 0.0185, baseZ + index * 0.022]}>
          <mesh>
            <cylinderGeometry args={[0.0062, 0.0062, 0.0058, 30]} />
            <meshStandardMaterial color="#c7cbd6" roughness={modules.knob.detent === 'hard' ? 0.22 : 0.35} metalness={0.78} />
          </mesh>
          <mesh position={[0, 0.0032, 0]}>
            <boxGeometry args={[0.0012, 0.001, 0.005]} />
            <meshBasicMaterial color="#2a2f3a" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function TrackPointModule({
  modules,
  caseWidth,
  caseDepth,
  forceVisible = false,
  forceCenterCluster = false,
}: {
  modules: ModulesConfig
  caseWidth: number
  caseDepth: number
  forceVisible?: boolean
  forceCenterCluster?: boolean
}) {
  if (!modules.trackpoint.enabled && !forceVisible) {
    return null
  }

  const useCenterCluster = forceCenterCluster || modules.trackpoint.zone === 'center_cluster'
  const position: [number, number, number] = useCenterCluster ? [0, 0.0176, -caseDepth * 0.02] : [0, 0.0176, -caseDepth * 0.07]

  const radius = modules.trackpoint.capType === 'low_profile' ? 0.0022 : modules.trackpoint.capType === 'soft_rim' ? 0.0028 : 0.0032

  return (
    <group>
      <mesh position={position}>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial color={modules.trackpoint.color} roughness={0.68} metalness={0.12} />
      </mesh>
      <mesh position={[position[0], position[1] - 0.0012, position[2]]}>
        <cylinderGeometry args={[radius * 0.55, radius * 0.55, 0.0025, 18]} />
        <meshStandardMaterial color={shiftColor(modules.trackpoint.color, -30)} roughness={0.72} metalness={0.08} />
      </mesh>
      <mesh position={[caseWidth * 0.001, position[1] - 0.0002, position[2]]}>
        <ringGeometry args={[radius * 1.6, radius * 1.9, 24]} />
        <meshBasicMaterial color={modules.trackpoint.color} transparent opacity={0.2 + modules.trackpoint.sensitivity * 0.1} />
      </mesh>
    </group>
  )
}

function shiftColor(hex: string, shift: number): string {
  const raw = hex.replace('#', '')
  if (raw.length !== 6) {
    return hex
  }

  const clamp = (value: number) => Math.max(0, Math.min(255, value))

  const r = clamp(parseInt(raw.slice(0, 2), 16) + shift)
  const g = clamp(parseInt(raw.slice(2, 4), 16) + shift)
  const b = clamp(parseInt(raw.slice(4, 6), 16) + shift)

  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g)
    .toString(16)
    .padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`
}

function DeskEnvironment() {
  const deskSetup = useKeyboardStore((state) => state.deskSetup)

  const deskmatRoughness =
    deskSetup.deskmat === 'glass'
      ? 0.08
      : deskSetup.deskmat === 'leather'
        ? 0.6
        : deskSetup.deskmat === 'wood'
          ? 0.75
          : 0.85

  const deskSurfaceTint =
    deskSetup.deskSurface === 'wood'
      ? '#2f271d'
      : deskSetup.deskSurface === 'glass'
        ? '#1e2c38'
        : deskSetup.deskSurface === 'stone'
          ? '#2f3136'
          : '#2b2b2b'

  const deskmatMetalness = deskSetup.deskmat === 'glass' ? 0.92 : 0.04
  const deskmatOpacity = deskSetup.deskmat === 'none' ? 0.05 : deskSetup.deskmat === 'glass' ? 0.75 : 1

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.0415, 0]} receiveShadow>
        <planeGeometry args={[2, 1.5]} />
        <meshStandardMaterial color={deskSurfaceTint} roughness={0.88} metalness={0.03} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <planeGeometry args={[2, 1.5]} />
        <meshStandardMaterial
          color={deskSetup.deskmatColor || '#1a1a1a'}
          roughness={deskmatRoughness}
          metalness={deskmatMetalness}
          transparent
          opacity={deskmatOpacity}
        />
      </mesh>

      {deskSetup.cable.enabled && <Cable type={deskSetup.cable.type} color={deskSetup.cable.color} />}

      <ContactShadows position={[0, -0.039, 0]} opacity={0.4} scale={2} blur={2.5} far={0.5} />
    </group>
  )
}

function Cable({ type, color }: { type: string; color: string }) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.15, 0.01, 0.05),
    new THREE.Vector3(0.2, 0.05, 0.1),
    new THREE.Vector3(0.25, 0.08, 0.15),
    new THREE.Vector3(0.3, 0.06, 0.2),
  ])

  const baseRadius = type === 'straight_usb' ? 0.002 : 0.003
  const geometry = new THREE.TubeGeometry(curve, 28, baseRadius, 10, false)

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
      </mesh>

      {type === 'coiled_usb' && <CoiledCable curve={curve} color={color} />}

      {type === 'aviator' && <CableConnector position={[0.195, 0.05, 0.1]} color="#c8ccd4" ringColor="#f0c26d" />}

      {type === 'lemo' && <CableConnector position={[0.21, 0.055, 0.115]} color="#d8dae0" ringColor="#8bd1ff" />}
    </group>
  )
}

function CableConnector({
  position,
  color,
  ringColor,
}: {
  position: [number, number, number]
  color: string
  ringColor: string
}) {
  return (
    <group position={position} rotation={[Math.PI / 5, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.0048, 0.0048, 0.011, 18]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.0065, 0]}>
        <torusGeometry args={[0.0045, 0.0007, 10, 26]} />
        <meshStandardMaterial color={ringColor} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

function CoiledCable({ curve, color }: { curve: THREE.CatmullRomCurve3; color: string }) {
  const coils = 8
  const coilRadius = 0.008

  const points: THREE.Vector3[] = []
  for (let i = 0; i <= coils * 20; i += 1) {
    const t = i / (coils * 20)
    const point = curve.getPoint(t)
    const angle = (i * Math.PI * 2) / 20
    point.x += Math.cos(angle) * coilRadius
    point.z += Math.sin(angle) * coilRadius
    points.push(point)
  }

  const coilCurve = new THREE.CatmullRomCurve3(points)
  const geometry = new THREE.TubeGeometry(coilCurve, coils * 20, 0.0015, 6, false)

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.25, 0.35]} fov={45} />
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={0.15}
        maxDistance={0.8}
        maxPolarAngle={Math.PI / 2}
        target={[0, 0, 0]}
      />

      {/* 使用环境光 + 双主灯，减少键帽顶面“发灰/发白”与高光破碎。 */}
      <Environment preset="studio" />
      <ambientLight intensity={0.26} />
      <hemisphereLight intensity={0.34} color="#dcefff" groundColor="#111a27" />
      <directionalLight position={[0.44, 0.48, 0.32]} intensity={0.92} color="#fff4e8" castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-0.38, 0.34, -0.26]} intensity={0.42} color="#c9dcff" />
      <pointLight position={[0, 0.16, 0.2]} intensity={0.12} color="#d7ebff" />
      <rectAreaLight position={[0, 0.27, 0.08]} width={0.48} height={0.34} intensity={0.26} color="#ffffff" />

      <Float speed={1} rotationIntensity={0} floatIntensity={0.02} floatingRange={[-0.001, 0.001]}>
        <Keyboard />
      </Float>

      <DeskEnvironment />
    </>
  )
}

export function KeyboardScene() {
  return (
    <Canvas
      shadows
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.04,
      }}
      style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)' }}
    >
      <Scene />
    </Canvas>
  )
}

export default KeyboardScene
