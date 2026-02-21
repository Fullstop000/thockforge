'use client'

import { MutableRefObject, useEffect, useMemo, useRef } from 'react'
import { RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'
import { ArtisanAssignment, SwitchConfig } from '@/types/keyboard'
import { DerivedKeycapMountParams, DerivedKeycapRenderParams } from '@/engine/deriveRenderParams'
import { GeometryBudget } from '@/types/renderingModel'
import { createKeycapSkirtGeometry, createTopSurfaceGeometry } from './KeycapGeometryFactory'
import { KeyTone, getKeycapTexture } from '@/utils/keycapTexture'
import {
  clamp,
  resolveDishSurfacePbr,
  resolveSideSurfacePbr,
  resolveTopSurfacePbr,
  shiftColor,
} from '@/components/3d/materials/pbrPresets'

export type ArtisanResourceKind = 'none' | 'image' | 'model' | 'invalid'

interface KeycapAssemblyProps {
  /** 主字符。 */
  label: string
  /** 副字符。 */
  subLabel?: string
  /** 键宽（u）。 */
  width: number
  /** 视觉 tone（用于纹理叠色）。 */
  tone: KeyTone
  /** 当前键帽推导参数。 */
  keycapParams: DerivedKeycapRenderParams
  /** 当前轴体配置（用于 O-Ring/卫星轴指示等）。 */
  switches: SwitchConfig
  /** 键帽与 stem 的卡接挂点参数。 */
  keycapMount: DerivedKeycapMountParams
  /** 几何预算（用于曲面细分）。 */
  geometryBudget: GeometryBudget
  /** 是否悬停。 */
  hovered: boolean
  /** 是否按下。 */
  isActive: boolean
  /** 随动组引用（由 façade 更新位姿）。 */
  movingGroupRef: MutableRefObject<THREE.Group | null>
  /** 卫星轴钢丝引用（由 façade 更新抖动）。 */
  stabilizerWireRef: MutableRefObject<THREE.Mesh | null>
  /** Artisan 绑定信息。 */
  artisanAssignment?: ArtisanAssignment
  /** Artisan 贴图（加载失败时为 null）。 */
  artisanTexture: THREE.Texture | null
  /** Artisan 资源类别。 */
  artisanResourceKind: ArtisanResourceKind
  /** 键帽组件整体透明度（0~1）。 */
  keycapOpacity: number
}

type MaterialOpacityState = {
  opacity: number
  transparent: boolean
  depthWrite: boolean
}

const MATERIAL_OPACITY_STATE_KEY = '__thockforgeMaterialOpacityState'

/**
 * 统一更新组内材质透明度。
 * 通过保存材质初始状态，避免透明化切换造成参数漂移。
 */
function applyGroupOpacity(group: THREE.Group | null, opacity: number) {
  if (!group) {
    return
  }

  const targetOpacity = clamp(opacity, 0, 1)
  group.traverse((node) => {
    const mesh = node as THREE.Mesh
    const materialValue = mesh.material
    if (!materialValue) {
      return
    }

    const materials = Array.isArray(materialValue) ? materialValue : [materialValue]
    materials.forEach((material) => {
      const mat = material as THREE.Material & {
        opacity?: number
        transparent?: boolean
        depthWrite?: boolean
        userData: Record<string, unknown>
      }

      if (typeof mat.opacity !== 'number' || typeof mat.transparent !== 'boolean' || typeof mat.depthWrite !== 'boolean') {
        return
      }

      if (!mat.userData[MATERIAL_OPACITY_STATE_KEY]) {
        const baseState: MaterialOpacityState = {
          opacity: mat.opacity,
          transparent: mat.transparent,
          depthWrite: mat.depthWrite,
        }
        mat.userData[MATERIAL_OPACITY_STATE_KEY] = baseState
      }

      const base = mat.userData[MATERIAL_OPACITY_STATE_KEY] as MaterialOpacityState
      mat.opacity = clamp(base.opacity * targetOpacity, 0, 1)
      mat.transparent = base.transparent || targetOpacity < 0.999
      mat.depthWrite = targetOpacity >= 0.999 ? base.depthWrite : false
      mat.needsUpdate = true
    })
  })
}

/**
 * 计算主字符位置。
 * 保持与统一参数映射一致，避免视图间口径漂移。
 */
function resolveLegendPosition(params: DerivedKeycapRenderParams): [number, number, number] {
  const { keyWidth, keyDepth, keyHeight, zoneConfig } = params

  if (zoneConfig.legendPosition === 'top_left') {
    return [-keyWidth * 0.18, keyHeight / 2 + 0.00165, -keyDepth * 0.1]
  }

  if (zoneConfig.legendPosition === 'front_side') {
    return [0, keyHeight / 2 - 0.001, keyDepth * 0.4]
  }

  if (zoneConfig.legendPosition === 'side_shine') {
    return [keyWidth * 0.4, keyHeight / 2 - 0.0008, 0]
  }

  return [0, keyHeight / 2 + 0.00165, keyDepth * -0.03]
}

/**
 * 键帽运动件装配：
 * - O-Ring / 键帽壳体 / 顶面连续曲面 / socket 挂点 / 字符 / 卫星轴钢丝 / Artisan。
 * - 严格禁用 ring overlay 类“非物理装饰几何”伪造顶面高光。
 */
export function KeycapAssembly({
  label,
  subLabel,
  width,
  tone,
  keycapParams,
  switches,
  keycapMount,
  geometryBudget,
  hovered,
  isActive,
  movingGroupRef,
  stabilizerWireRef,
  artisanAssignment,
  artisanTexture,
  artisanResourceKind,
  keycapOpacity,
}: KeycapAssemblyProps) {
  const assemblyRootRef = useRef<THREE.Group | null>(null)
  const texture = useMemo(() => getKeycapTexture(keycapParams.zoneConfig.theme, tone), [keycapParams.zoneConfig.theme, tone])

  const topSurfaceGeometry = useMemo(
    () =>
      createTopSurfaceGeometry({
        width: keycapParams.topPlateWidth * 0.985,
        depth: keycapParams.topPlateDepth * 0.985,
        dishDepth: keycapParams.topDishDepth,
        rowSculptBias: keycapParams.rowSculptNormalized,
        segmentsX: geometryBudget.keycapTopSegmentsX,
        segmentsZ: geometryBudget.keycapTopSegmentsZ,
      }),
    [
      geometryBudget.keycapTopSegmentsX,
      geometryBudget.keycapTopSegmentsZ,
      keycapParams.rowSculptNormalized,
      keycapParams.topDishDepth,
      keycapParams.topPlateDepth,
      keycapParams.topPlateWidth,
    ]
  )
  const skirtGeometry = useMemo(
    () =>
      createKeycapSkirtGeometry({
        bottomWidth: keycapParams.keyWidth,
        bottomDepth: keycapParams.keyDepth,
        topWidth: keycapParams.topPlateWidth + keycapParams.topInset * 0.44,
        topDepth: keycapParams.topPlateDepth + keycapParams.topDepthInset * 0.42,
        height: keycapParams.keyHeight,
        belly: clamp(Math.min(keycapParams.keyWidth, keycapParams.keyDepth) * 0.026, 0.0001, 0.00045),
        crownLift: keycapParams.profilePreset.crownLift * 0.24,
        radialSegments: clamp(Math.round(geometryBudget.keycapTopSegmentsX * 2.1), 24, 68),
        heightSegments: clamp(Math.round(geometryBudget.keycapTopSegmentsZ * 0.92), 8, 20),
      }),
    [
      geometryBudget.keycapTopSegmentsX,
      geometryBudget.keycapTopSegmentsZ,
      keycapParams.keyDepth,
      keycapParams.keyHeight,
      keycapParams.keyWidth,
      keycapParams.profilePreset.crownLift,
      keycapParams.topDepthInset,
      keycapParams.topPlateDepth,
      keycapParams.topPlateWidth,
      keycapParams.topInset,
    ]
  )

  const topPbr = useMemo(
    () => resolveTopSurfacePbr(keycapParams.materialPreset, keycapParams.wearRatio),
    [keycapParams.materialPreset, keycapParams.wearRatio]
  )
  const sidePbr = useMemo(
    () => resolveSideSurfacePbr(keycapParams.materialPreset, keycapParams.wearRatio),
    [keycapParams.materialPreset, keycapParams.wearRatio]
  )
  const dishPbr = useMemo(
    () => resolveDishSurfacePbr(keycapParams.materialPreset, keycapParams.wearRatio),
    [keycapParams.materialPreset, keycapParams.wearRatio]
  )

  const zoneConfig = keycapParams.zoneConfig
  const legendPosition = useMemo(() => resolveLegendPosition(keycapParams), [keycapParams])
  const legendManufacturing = zoneConfig.legendManufacturing
  const showPrimaryLegend = zoneConfig.legendPrimary !== 'none' && Boolean(label) && legendManufacturing !== 'blank'
  const showSubLegend = zoneConfig.legendSub !== 'none' && Boolean(subLabel) && legendManufacturing !== 'blank'
  const hasStabilizer = width >= 2
  const stabilizerOffset = keycapParams.keyWidth * 0.31

  const activeGlow = isActive ? 0.2 : hovered ? 0.08 : 0
  const dishRotationX = -keycapParams.profileAngle * 0.58

  useEffect(() => {
    // 依赖每次渲染同步透明度，确保条件分支新建 mesh 也能立即继承可见性状态。
    applyGroupOpacity(assemblyRootRef.current, keycapOpacity)
  })

  return (
    <group ref={assemblyRootRef}>
      <group ref={movingGroupRef}>
      {switches.orings.enabled && (
        <mesh position={[0, keycapMount.socketCenterY + keycapMount.socketDepth * 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.0017, switches.orings.thickness === 'thick' ? 0.00035 : 0.00024, 10, 24]} />
          <meshStandardMaterial color="#2f343e" roughness={0.84} metalness={0.02} />
        </mesh>
      )}

      <mesh geometry={skirtGeometry}>
        <meshPhysicalMaterial
          color={keycapParams.colors.sideColor}
          map={texture}
          roughness={sidePbr.roughness}
          metalness={sidePbr.metalness}
          clearcoat={sidePbr.clearcoat}
          clearcoatRoughness={sidePbr.clearcoatRoughness}
          envMapIntensity={0.72}
        />
      </mesh>

      <RoundedBox
        args={[keycapParams.topPlateWidth, keycapParams.topPlateHeight, keycapParams.topPlateDepth]}
        radius={keycapParams.shellRadius * 0.74}
        smoothness={8}
        rotation={[dishRotationX, 0, 0]}
        position={[0, keycapParams.topPlateY, 0]}
      >
        <meshPhysicalMaterial
          color={keycapParams.colors.topColor}
          map={texture}
          roughness={topPbr.roughness}
          metalness={topPbr.metalness}
          clearcoat={topPbr.clearcoat}
          clearcoatRoughness={topPbr.clearcoatRoughness}
          emissive={activeGlow > 0 ? keycapParams.colors.stemAccent : '#000000'}
          emissiveIntensity={activeGlow}
          envMapIntensity={0.94}
        />
      </RoundedBox>

      <mesh geometry={topSurfaceGeometry} position={[0, keycapParams.topSurfaceY, 0]} rotation={[dishRotationX, 0, 0]}>
        <meshPhysicalMaterial
          color={keycapParams.colors.dishColor}
          map={texture}
          roughness={dishPbr.roughness}
          metalness={dishPbr.metalness}
          clearcoat={dishPbr.clearcoat}
          clearcoatRoughness={dishPbr.clearcoatRoughness}
          envMapIntensity={1.06}
        />
      </mesh>

      <mesh position={[0, -keycapParams.keyHeight / 2 + keycapParams.cavityHeight * 0.5 + 0.00008, 0]}>
        <boxGeometry args={[keycapParams.cavityWidth, keycapParams.cavityHeight, keycapParams.cavityDepth]} />
        <meshStandardMaterial
          color={shiftColor(keycapParams.colors.sideColor, -18)}
          roughness={Math.min(1, sidePbr.roughness + 0.08)}
          metalness={Math.max(0, sidePbr.metalness - 0.02)}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Stem socket: 真实挂点语义，表达键帽与轴心十字柱的卡接关系。 */}
      <mesh position={[0, keycapMount.socketCenterY, 0]}>
        <boxGeometry args={[keycapMount.socketOuterWidth, keycapMount.socketDepth, keycapMount.socketOuterDepth]} />
        <meshPhysicalMaterial
          color={shiftColor(keycapParams.colors.sideColor, -18)}
          roughness={0.66}
          metalness={0.06}
          clearcoat={0.11}
        />
      </mesh>

      <mesh position={[0, keycapMount.socketCenterY + keycapMount.socketDepth * 0.08, 0]}>
        <boxGeometry args={[keycapMount.socketCrossSlot, keycapMount.socketDepth * 0.74, keycapMount.socketOuterDepth * 0.84]} />
        <meshStandardMaterial color={shiftColor(keycapParams.colors.sideColor, -30)} roughness={0.72} metalness={0.02} />
      </mesh>
      <mesh position={[0, keycapMount.socketCenterY + keycapMount.socketDepth * 0.08, 0]}>
        <boxGeometry args={[keycapMount.socketOuterWidth * 0.84, keycapMount.socketDepth * 0.74, keycapMount.socketCrossSlot]} />
        <meshStandardMaterial color={shiftColor(keycapParams.colors.sideColor, -30)} roughness={0.72} metalness={0.02} />
      </mesh>

      {/* Socket reinforcing ribs: 提升挂点周围结构连续性，避免示意化薄壁。 */}
      {[-1, 1].map((dir) => (
        <mesh key={`rib-x-${dir}`} position={[dir * keycapMount.socketOuterWidth * 0.34, keycapMount.ribCenterY, 0]}>
          <boxGeometry args={[keycapMount.ribThickness, keycapMount.ribHeight, keycapMount.socketOuterDepth * 0.84]} />
          <meshStandardMaterial color={shiftColor(keycapParams.colors.sideColor, -24)} roughness={0.62} metalness={0.08} />
        </mesh>
      ))}
      {[-1, 1].map((dir) => (
        <mesh key={`rib-z-${dir}`} position={[0, keycapMount.ribCenterY, dir * keycapMount.socketOuterDepth * 0.34]}>
          <boxGeometry args={[keycapMount.socketOuterWidth * 0.84, keycapMount.ribHeight, keycapMount.ribThickness]} />
          <meshStandardMaterial color={shiftColor(keycapParams.colors.sideColor, -24)} roughness={0.62} metalness={0.08} />
        </mesh>
      ))}

      {showPrimaryLegend && (
        <Text
          position={legendPosition}
          rotation={[-Math.PI / 2 - keycapParams.profileAngle * 0.16, 0, zoneConfig.legendPosition === 'side_shine' ? Math.PI / 2 : 0]}
          fontSize={label.length > 2 ? 0.0038 : 0.0049}
          color={keycapParams.colors.legendColor}
          fillOpacity={keycapParams.legendPrimaryOpacity}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}

      {showSubLegend && (
        <Text
          position={[0, keycapParams.keyHeight / 2 + 0.0016, keycapParams.keyDepth * 0.23]}
          rotation={[-Math.PI / 2 - keycapParams.profileAngle * 0.16, 0, 0]}
          fontSize={0.0028}
          color={legendManufacturing === 'dye_sub' ? shiftColor(keycapParams.colors.legendColor, -10) : keycapParams.colors.legendColor}
          fillOpacity={keycapParams.legendSubOpacity}
          anchorX="center"
          anchorY="middle"
        >
          {subLabel}
        </Text>
      )}

      {hasStabilizer && (
        <mesh ref={stabilizerWireRef} position={[0, -keycapParams.keyHeight / 2 + 0.0015, 0]}>
          <boxGeometry args={[stabilizerOffset * 2.05, 0.00035, 0.0007]} />
          <meshStandardMaterial color="#b8becb" roughness={0.34} metalness={0.7} />
        </mesh>
      )}

      {artisanAssignment && (
        <group position={[0, keycapParams.keyHeight / 2 + 0.0042, 0]}>
          {artisanTexture && artisanResourceKind === 'image' ? (
            <mesh>
              <cylinderGeometry args={[0.0031, 0.0027, 0.0065, 24]} />
              <meshPhysicalMaterial
                map={artisanTexture}
                color="#ffffff"
                roughness={0.3}
                metalness={0.08}
                clearcoat={0.52}
                clearcoatRoughness={0.16}
              />
            </mesh>
          ) : (
            <mesh>
              <icosahedronGeometry args={[0.0032, 0]} />
              <meshPhysicalMaterial
                color={
                  artisanAssignment.materialHint === 'metal'
                    ? '#cbd1dc'
                    : artisanAssignment.materialHint === 'stone'
                      ? '#9db2ba'
                      : '#7ce4ff'
                }
                roughness={artisanAssignment.materialHint === 'metal' ? 0.2 : 0.34}
                metalness={artisanAssignment.materialHint === 'metal' ? 0.72 : 0.26}
                clearcoat={0.45}
              />
            </mesh>
          )}
          <Text position={[0, 0.0035, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.0018} color="#d8fbff" anchorX="center" anchorY="middle">
            {artisanResourceKind === 'model' ? '3D' : artisanResourceKind === 'invalid' ? 'ERR' : 'ART'}
          </Text>
        </group>
      )}

      {(hovered || isActive) && (
        <mesh position={[0, keycapParams.keyHeight / 2 + 0.002, 0]}>
          <boxGeometry args={[keycapParams.keyWidth + 0.001, 0.00012, keycapParams.keyDepth + 0.001]} />
          <meshBasicMaterial color={keycapParams.colors.stemAccent} transparent opacity={isActive ? 0.2 : 0.11} />
        </mesh>
      )}
      </group>
    </group>
  )
}

export default KeycapAssembly
