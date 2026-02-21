'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { InternalsConfig, KeycapConfig, KeycapZone, SwitchConfig } from '@/types/keyboard'
import { KeyTone } from '@/utils/keycapTexture'
import { deriveRenderParams } from '@/engine/deriveRenderParams'
import { keyAnimationScheduler } from '@/engine/keyAnimationScheduler'
import { RENDER_GEOMETRY_BUDGETS, RenderQualityTier } from '@/types/renderingModel'
import { clamp } from '@/components/3d/materials/pbrPresets'
import { KeycapAssembly, ArtisanResourceKind } from './keycap/KeycapAssembly'
import { SwitchAssembly } from './switch/SwitchAssembly'

interface KeycapProps {
  id: string
  label: string
  subLabel?: string
  width: number
  depth: number
  row: number
  zone: KeycapZone
  tone?: KeyTone
  config: KeycapConfig
  switches: SwitchConfig
  mods: InternalsConfig['mods']
  isActive?: boolean
  isFlexLinked?: boolean
  quality?: RenderQualityTier
  /** 键帽总透明度（0~1）。 */
  keycapOpacity?: number
  /** 轴体总透明度（0~1）。 */
  switchOpacity?: number
  onPress?: () => void
  position: [number, number, number]
}

/**
 * 识别 artisan 资源类型：
 * - image: 可直接作为贴图加载。
 * - model: 当前使用占位几何，并保留后续 glTF 接入扩展口。
 */
function resolveArtisanResourceKind(url: string): 'image' | 'model' | 'none' {
  const normalized = url.trim().toLowerCase()
  if (!normalized) {
    return 'none'
  }

  if (normalized.startsWith('data:image/')) {
    return 'image'
  }

  if (normalized.startsWith('data:model/')) {
    return 'model'
  }

  if (/\.(glb|gltf|obj|fbx|stl)(\?.*)?(#.*)?$/.test(normalized)) {
    return 'model'
  }

  return 'image'
}

/**
 * Keycap façade：
 * - 外部接口保持兼容（KeyboardScene 调用不变）。
 * - 内部统一走 deriveRenderParams + keyAnimationScheduler。
 * - 几何/材质/装配细节全部下沉到 KeycapAssembly + SwitchAssembly。
 */
export function Keycap({
  id,
  label,
  subLabel,
  width,
  depth,
  row,
  zone,
  tone = 'default',
  config,
  switches,
  mods,
  isActive = false,
  isFlexLinked = false,
  quality,
  keycapOpacity = 1,
  switchOpacity = 1,
  onPress,
  position,
}: KeycapProps) {
  const movingGroupRef = useRef<THREE.Group>(null)
  const stemGroupRef = useRef<THREE.Group>(null)
  const springRef = useRef<THREE.Mesh>(null)
  const stabilizerWireRef = useRef<THREE.Mesh>(null)
  const clickJacketRef = useRef<THREE.Mesh>(null)
  const artisanTextureRef = useRef<THREE.Texture | null>(null)

  const [hovered, setHovered] = useState(false)
  const [artisanTexture, setArtisanTexture] = useState<THREE.Texture | null>(null)
  const [artisanResourceKind, setArtisanResourceKind] = useState<ArtisanResourceKind>('none')

  const derived = useMemo(
    () =>
      deriveRenderParams(
        {
          keycaps: config,
          switches,
          internals: { mods },
        },
        {
          zone,
          keyId: id,
          row,
          width,
          depth,
          tone,
          isFlexLinked,
          quality,
        }
      ),
    [config, depth, id, isFlexLinked, mods, quality, row, switches, tone, width, zone]
  )

  const geometryBudget = useMemo(() => RENDER_GEOMETRY_BUDGETS[derived.quality], [derived.quality])
  const hasStabilizer = width >= 2
  const stabilizerOffset = derived.keycap.keyWidth * 0.31

  const artisanAssignment = useMemo(
    () => (config.artisan.enabled ? config.artisan.items.find((item) => item.keyId === id) : undefined),
    [config.artisan.enabled, config.artisan.items, id]
  )
  const artisanUrl = artisanAssignment?.url?.trim() || ''

  useEffect(() => {
    keyAnimationScheduler.registerKey(id)
    return () => {
      keyAnimationScheduler.unregisterKey(id)
    }
  }, [id])

  useEffect(() => {
    keyAnimationScheduler.setPressed(id, isActive)
  }, [id, isActive])

  useEffect(() => {
    const disposeActiveTexture = () => {
      if (!artisanTextureRef.current) {
        return
      }

      artisanTextureRef.current.dispose()
      artisanTextureRef.current = null
    }

    disposeActiveTexture()
    setArtisanTexture(null)

    const kind = resolveArtisanResourceKind(artisanUrl)
    if (!artisanAssignment || kind === 'none') {
      setArtisanResourceKind('none')
      return
    }

    if (kind === 'model') {
      setArtisanResourceKind('model')
      return
    }

    setArtisanResourceKind('image')
    let cancelled = false
    const loader = new THREE.TextureLoader()

    loader.load(
      artisanUrl,
      (texture) => {
        if (cancelled) {
          texture.dispose()
          return
        }

        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = 4
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        artisanTextureRef.current = texture
        setArtisanTexture(texture)
      },
      undefined,
      () => {
        if (cancelled) {
          return
        }
        // 资源加载失败时回退到稳定占位体，不能阻塞主渲染循环。
        setArtisanResourceKind('invalid')
      }
    )

    return () => {
      cancelled = true
      disposeActiveTexture()
    }
  }, [artisanAssignment, artisanUrl])

  useFrame((_, delta) => {
    const sample = keyAnimationScheduler.sample({
      delta,
      keyId: id,
      switchType: switches.type,
      switchParams: {
        baseTravel: derived.switches.baseTravel,
        preTravelMm: derived.switches.preTravelMm,
        springStiffness: derived.switches.springStiffness,
        springDamping: derived.switches.springDamping,
        bumpCenter: derived.switches.bumpCenter,
        bumpWidth: derived.switches.bumpWidth,
        bumpStrength: derived.switches.bumpStrength,
      },
      animationParams: derived.animation,
      stabilizerAmplitude: derived.switches.stabilizerAmplitude,
      profileAngle: derived.keycap.profileAngle,
    })

    const rawTravel = Number.isFinite(sample.travel) ? sample.travel : 0
    const maxTravelBySwitch = Math.max(0, derived.switches.baseTravel)
    const maxTravelByCase = Math.max(0, -(derived.assemblyLite.caseInnerFloorY + 0.0002) - derived.keycap.keyHeight * 0.5)
    const maxTravel = Math.max(0, Math.min(maxTravelBySwitch, maxTravelByCase))
    const clampedTravel = clamp(rawTravel, 0, maxTravel)
    const clampedPressRatio = maxTravelBySwitch > 0 ? clamp(clampedTravel / maxTravelBySwitch, 0, 1) : 0

    const rawJitter = Number.isFinite(sample.lateralJitter) ? sample.lateralJitter : 0
    const clampedJitter = clamp(rawJitter, -derived.keycapMount.lateralJitterLimit, derived.keycapMount.lateralJitterLimit)

    const clampedTiltX = clamp(Number.isFinite(sample.tiltX) ? sample.tiltX : 0, -0.06, 0.06)
    const clampedTiltZ = clamp(Number.isFinite(sample.tiltZ) ? sample.tiltZ : 0, -0.045, 0.045)
    const totalTravel = clampedTravel + derived.animation.flexDrop

    if (movingGroupRef.current) {
      movingGroupRef.current.position.set(clampedJitter, -(totalTravel), 0)
      movingGroupRef.current.rotation.set(clampedTiltX, 0, clampedTiltZ)
    }

    if (stemGroupRef.current) {
      stemGroupRef.current.position.set(
        clampedJitter * derived.keycapMount.stemFollowerJitterRatio,
        derived.switches.stemBaseY - totalTravel,
        0
      )
      stemGroupRef.current.rotation.set(clampedTiltX * 0.16, 0, clampedTiltZ * 0.16)
    }

    if (springRef.current) {
      const compressionScale = clamp(1 - clampedPressRatio * 0.55, 0.35, 1)
      springRef.current.scale.y = compressionScale
      springRef.current.position.y =
        derived.switches.switchBottomY + derived.switchStructure.bottomHousingHeight * 0.38 - clampedPressRatio * 0.0006
    }

    if (stabilizerWireRef.current) {
      const wireWobble = switches.stabilizerQuality === 'perfect' ? 0 : clampedJitter * 95
      stabilizerWireRef.current.rotation.z = wireWobble
    }

    if (clickJacketRef.current) {
      clickJacketRef.current.position.y = -0.0018 - clampedPressRatio * 0.0007
    }
  })

  return (
    <group
      position={position}
      onPointerDown={(event) => {
        event.stopPropagation()
        onPress?.()
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <SwitchAssembly
        switches={switches}
        mods={mods}
        hasStabilizer={hasStabilizer}
        switchParams={derived.switches}
        switchStructure={derived.switchStructure}
        keycapMount={derived.keycapMount}
        stabilizerOffset={stabilizerOffset}
        stemGroupRef={stemGroupRef}
        springRef={springRef}
        clickJacketRef={clickJacketRef}
        switchOpacity={switchOpacity}
      />

      <KeycapAssembly
        label={label}
        subLabel={subLabel}
        width={width}
        tone={tone}
        keycapParams={derived.keycap}
        switches={switches}
        keycapMount={derived.keycapMount}
        geometryBudget={geometryBudget}
        hovered={hovered}
        isActive={isActive}
        movingGroupRef={movingGroupRef}
        stabilizerWireRef={stabilizerWireRef}
        artisanAssignment={artisanAssignment}
        artisanTexture={artisanTexture}
        artisanResourceKind={artisanResourceKind}
        keycapOpacity={keycapOpacity}
      />
    </group>
  )
}

export default Keycap
