'use client'

import { MutableRefObject, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { InternalsConfig, SwitchConfig } from '@/types/keyboard'
import {
  DerivedKeycapMountParams,
  DerivedSwitchRenderParams,
  DerivedSwitchStructureParams,
} from '@/engine/deriveRenderParams'
import { clamp } from '@/components/3d/materials/pbrPresets'

interface SwitchAssemblyProps {
  /** 轴体配置。 */
  switches: SwitchConfig
  /** 内胆改模（当前仅消费 Holee mod）。 */
  mods: Pick<InternalsConfig['mods'], 'holeeMod'>
  /** 是否为大键。 */
  hasStabilizer: boolean
  /** 轴体动态推导参数。 */
  switchParams: DerivedSwitchRenderParams
  /** 轴体结构推导参数。 */
  switchStructure: DerivedSwitchStructureParams
  /** 键帽挂点推导参数。 */
  keycapMount: DerivedKeycapMountParams
  /** 卫星轴支点偏移（m）。 */
  stabilizerOffset: number
  /** stem 动件组引用（由 façade 动画控制位姿）。 */
  stemGroupRef: MutableRefObject<THREE.Group | null>
  /** 弹簧 mesh 引用（由 façade 动画控制压缩）。 */
  springRef: MutableRefObject<THREE.Mesh | null>
  /** Click Jacket 引用（由 façade 动画控制位置）。 */
  clickJacketRef: MutableRefObject<THREE.Mesh | null>
  /** 轴体组件整体透明度（0~1）。 */
  switchOpacity: number
}

type MaterialOpacityState = {
  opacity: number
  transparent: boolean
  depthWrite: boolean
}

const MATERIAL_OPACITY_STATE_KEY = '__thockforgeMaterialOpacityState'

/**
 * 统一更新组内材质透明度。
 * 通过缓存材质初始状态，确保切换后可恢复。
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
 * 轴体装配组件（结构级语义）：
 * 1. bottom/top housing、簧片、引脚为静件。
 * 2. stem 作为唯一核心动件，与键帽 socket 对应挂接。
 * 3. 弹簧仅做压缩可视化，不承担主动力学计算。
 */
export function SwitchAssembly({
  switches,
  mods,
  hasStabilizer,
  switchParams,
  switchStructure,
  keycapMount,
  stabilizerOffset,
  stemGroupRef,
  springRef,
  clickJacketRef,
  switchOpacity,
}: SwitchAssemblyProps) {
  const assemblyRootRef = useRef<THREE.Group | null>(null)
  const housingWidth = clamp(switchStructure.housingWidth, 0.0126, switchParams.switchFootprint)
  const housingDepth = clamp(switchStructure.housingDepth, 0.0126, switchParams.switchFootprint)
  const bottomHeight = clamp(switchStructure.bottomHousingHeight, 0.0036, 0.0062)
  const topHeight = clamp(switchStructure.topHousingHeight, 0.002, 0.0038)

  const springRadius = clamp((switchParams.springOuterDiaMm / 1000) * 0.235, 0.00095, 0.00135)
  const springHeight = clamp((switchParams.springFreeLengthMm / 1000) * 0.18, 0.0022, 0.0034)
  const springSegments = clamp(Math.round(switchParams.springCoils * 0.9), 16, 28)
  const filmTubeRadius = clamp(switchParams.filmThicknessMm / 1000 + 0.0001, 0.00016, 0.00032)

  const pinRadius = clamp(housingWidth * 0.05, 0.00045, 0.00065)
  const pinLength = clamp(switchStructure.pinLength, 0.0021, 0.0038)
  const metalLeafHeight = clamp(switchStructure.metalLeafHeight, 0.0035, 0.0058)

  const stemPoleWidth = clamp(switchStructure.stemPoleWidth, 0.0031, 0.0046)
  const stemPoleDepth = clamp(switchStructure.stemPoleDepth, 0.0031, 0.0046)
  const stemPoleHeight = clamp(switchStructure.stemPoleHeight, 0.0026, 0.0045)
  const stemCrossArm = clamp(switchStructure.stemCrossArm, 0.0031, 0.0046)
  const stemCrossSlot = clamp(switchStructure.stemCrossSlot, 0.00095, 0.00145)
  const stemCapHeight = clamp(switchStructure.stemCapHeight, 0.0009, 0.0016)

  useEffect(() => {
    // 依赖每次渲染同步透明度，避免动态子件在隐藏状态下漏刷材质参数。
    applyGroupOpacity(assemblyRootRef.current, switchOpacity)
  })

  return (
    <group ref={assemblyRootRef}>
      {/* Bottom housing: 轴体静件基座，不参与按键动态。 */}
      <mesh position={[0, switchParams.switchBottomY, 0]}>
        <boxGeometry args={[housingWidth, bottomHeight, housingDepth]} />
        <meshStandardMaterial color={switchParams.switchBottomColor} roughness={0.62} metalness={0.12} />
      </mesh>

      {/* Top housing: 轴体上盖静件。 */}
      <mesh position={[0, switchParams.switchTopY, 0]}>
        <boxGeometry args={[housingWidth * 0.97, topHeight, housingDepth * 0.97]} />
        <meshPhysicalMaterial
          color={switchParams.switchTopColor}
          roughness={0.42}
          metalness={0.08}
          clearcoat={0.24}
          transparent={switchParams.switchTopIsTransparent}
          opacity={switchParams.switchTopIsTransparent ? 0.64 : 1}
          transmission={switchParams.switchTopIsTransparent ? 0.22 : 0}
        />
      </mesh>

      {/* Metal leaf: 段落/点击反馈结构示意，保持在静件侧壁。 */}
      <mesh position={[housingWidth * 0.33, switchParams.switchTopY - 0.0002, 0]}>
        <boxGeometry args={[0.00058, metalLeafHeight, housingDepth * 0.33]} />
        <meshStandardMaterial color="#aeb8c8" roughness={0.38} metalness={0.72} />
      </mesh>

      {/* Pins: 触点引脚，表达可拆卸轴体底部实体特征。 */}
      {[-0.5, 0.5].map((dir) => (
        <mesh
          key={dir}
          position={[switchStructure.pinSpan * dir, switchParams.switchBottomY - bottomHeight * 0.46, housingDepth * 0.12]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[pinRadius, pinRadius * 0.86, pinLength, 10]} />
          <meshStandardMaterial color="#cda55f" roughness={0.28} metalness={0.84} />
        </mesh>
      ))}

      <mesh ref={springRef} position={[0, switchParams.switchBottomY + bottomHeight * 0.38, 0]}>
        <cylinderGeometry args={[springRadius, springRadius, springHeight, springSegments, 1, true]} />
        <meshStandardMaterial color="#bcc6d8" roughness={0.32} metalness={0.65} wireframe />
      </mesh>

      {switches.film !== 'none' && (
        <mesh position={[0, switchParams.switchTopY + topHeight * 0.63, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[housingWidth * 0.36, filmTubeRadius, 8, 24]} />
          <meshBasicMaterial color={switches.film === 'pc' ? '#baf4ff' : switches.film === 'pom' ? '#ffe6ad' : '#f8d8ff'} />
        </mesh>
      )}

      {hasStabilizer && (
        <group>
          {[-1, 1].map((dir) => (
            <group key={dir} position={[stabilizerOffset * dir, switchParams.switchTopY - 0.00065, 0]}>
              <mesh>
                <boxGeometry args={[0.0028, 0.0032, 0.0028]} />
                <meshStandardMaterial color="#f2f5fb" roughness={0.52} metalness={0.08} />
              </mesh>
              {mods.holeeMod && (
                <mesh position={[0, -0.0014, 0]}>
                  <boxGeometry args={[0.0032, 0.00032, 0.001]} />
                  <meshBasicMaterial color="#d9f28a" />
                </mesh>
              )}
            </group>
          ))}
        </group>
      )}

      {switches.type === 'silent' && (
        <>
          <mesh position={[0, switchParams.switchTopY + topHeight * 0.74, 0]}>
            <boxGeometry args={[0.0038, 0.0003, 0.0038]} />
            <meshBasicMaterial color="#8f96a1" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, switchParams.switchBottomY - bottomHeight * 0.58, 0]}>
            <boxGeometry args={[0.0038, 0.0003, 0.0038]} />
            <meshBasicMaterial color="#8f96a1" transparent opacity={0.8} />
          </mesh>
        </>
      )}

      {/* Stem: 唯一主动态件；键帽 socket 挂接关系由此件建立。 */}
      <group ref={stemGroupRef} position={[0, switchParams.stemBaseY, 0]}>
        <mesh position={[0, stemPoleHeight * 0.5, 0]}>
          <boxGeometry args={[stemPoleWidth, stemPoleHeight, stemPoleDepth]} />
          <meshPhysicalMaterial color={switchParams.switchStemColor} roughness={0.34} metalness={0.06} clearcoat={0.26} />
        </mesh>

        <mesh position={[0, stemPoleHeight + stemCapHeight * 0.5, 0]}>
          <boxGeometry args={[stemPoleWidth * 0.74, stemCapHeight, stemPoleDepth * 0.74]} />
          <meshPhysicalMaterial color={switchParams.switchStemColor} roughness={0.3} metalness={0.06} clearcoat={0.3} />
        </mesh>

        <mesh position={[0, stemPoleHeight + keycapMount.engagementDepth * 0.14, 0]}>
          <boxGeometry args={[stemCrossSlot, stemCapHeight * 0.92, stemCrossArm]} />
          <meshPhysicalMaterial color={switchParams.switchStemColor} roughness={0.36} metalness={0.05} clearcoat={0.24} />
        </mesh>
        <mesh position={[0, stemPoleHeight + keycapMount.engagementDepth * 0.14, 0]}>
          <boxGeometry args={[stemCrossArm, stemCapHeight * 0.92, stemCrossSlot]} />
          <meshPhysicalMaterial color={switchParams.switchStemColor} roughness={0.36} metalness={0.05} clearcoat={0.24} />
        </mesh>

        {switches.type === 'clicky' && (
          <mesh ref={clickJacketRef} position={[0, -0.0018, housingDepth * 0.19]}>
            <boxGeometry args={[0.0019, 0.0014, 0.0014]} />
            <meshStandardMaterial color="#f3be59" roughness={0.34} metalness={0.12} />
          </mesh>
        )}
      </group>
    </group>
  )
}

export default SwitchAssembly
