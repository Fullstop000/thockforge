'use client'

import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, OrbitControls, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { KeycapZoneConfig } from '@/types/keyboard'
import { deriveKeycapRenderParamsFromZone } from '@/engine/deriveRenderParams'
import { RENDER_GEOMETRY_BUDGETS } from '@/types/renderingModel'
import { createTopSurfaceGeometry } from '@/components/3d/keycap/KeycapGeometryFactory'
import {
  resolveDishSurfacePbr,
  resolveSideSurfacePbr,
  resolveTopSurfacePbr,
  shiftColor,
} from '@/components/3d/materials/pbrPresets'

interface KeycapTurntableProps {
  keycapZone: KeycapZoneConfig
  className?: string
}

interface PreviewKeycapProps {
  zone: KeycapZoneConfig
  sizeU: number
  position: [number, number, number]
}

const UNIT_SIZE = 0.01905
const PREVIEW_SIZES_ROW_ONE: number[] = [1, 1.25, 1.75, 2.25, 2.75]
const PREVIEW_SIZES_ROW_TWO: number[] = [6.25]

/**
 * 单个预览键帽：直接消费统一推导参数，避免独立 profile/material 映射漂移。
 */
function PreviewKeycap({ zone, sizeU, position }: PreviewKeycapProps) {
  const keycap = useMemo(
    () =>
      deriveKeycapRenderParamsFromZone({
        zoneConfig: zone,
        keyId: `turntable-${sizeU}`,
        row: 2,
        width: sizeU,
        depth: 1,
      }),
    [sizeU, zone]
  )

  const geometryBudget = RENDER_GEOMETRY_BUDGETS.balanced

  const topSurfaceGeometry = useMemo(
    () =>
      createTopSurfaceGeometry({
        width: keycap.topPlateWidth * 0.985,
        depth: keycap.topPlateDepth * 0.985,
        dishDepth: keycap.topDishDepth,
        rowSculptBias: keycap.rowSculptNormalized,
        segmentsX: geometryBudget.keycapTopSegmentsX,
        segmentsZ: geometryBudget.keycapTopSegmentsZ,
      }),
    [
      geometryBudget.keycapTopSegmentsX,
      geometryBudget.keycapTopSegmentsZ,
      keycap.rowSculptNormalized,
      keycap.topDishDepth,
      keycap.topPlateDepth,
      keycap.topPlateWidth,
    ]
  )

  const topPbr = useMemo(() => resolveTopSurfacePbr(keycap.materialPreset, keycap.wearRatio), [keycap.materialPreset, keycap.wearRatio])
  const sidePbr = useMemo(() => resolveSideSurfacePbr(keycap.materialPreset, keycap.wearRatio), [keycap.materialPreset, keycap.wearRatio])
  const dishPbr = useMemo(() => resolveDishSurfacePbr(keycap.materialPreset, keycap.wearRatio), [keycap.materialPreset, keycap.wearRatio])

  return (
    <group position={position} rotation={[-0.12, 0, 0]}>
      <RoundedBox args={[keycap.keyWidth, keycap.keyHeight, keycap.keyDepth]} radius={keycap.shellRadius} smoothness={6} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={keycap.colors.sideColor}
          roughness={sidePbr.roughness}
          metalness={sidePbr.metalness}
          clearcoat={sidePbr.clearcoat}
          clearcoatRoughness={sidePbr.clearcoatRoughness}
        />
      </RoundedBox>

      <RoundedBox
        args={[keycap.topPlateWidth, keycap.topPlateHeight, keycap.topPlateDepth]}
        radius={keycap.shellRadius * 0.74}
        smoothness={6}
        position={[0, keycap.topPlateY, 0]}
        rotation={[-keycap.profileAngle * 0.58, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={keycap.colors.topColor}
          roughness={topPbr.roughness}
          metalness={topPbr.metalness}
          clearcoat={topPbr.clearcoat}
          clearcoatRoughness={topPbr.clearcoatRoughness}
        />
      </RoundedBox>

      <mesh geometry={topSurfaceGeometry} position={[0, keycap.topSurfaceY, 0]} rotation={[-keycap.profileAngle * 0.58, 0, 0]} castShadow>
        <meshPhysicalMaterial
          color={keycap.colors.dishColor}
          roughness={dishPbr.roughness}
          metalness={dishPbr.metalness}
          clearcoat={dishPbr.clearcoat}
          clearcoatRoughness={dishPbr.clearcoatRoughness}
        />
      </mesh>

      <mesh position={[0, -keycap.keyHeight / 2 + keycap.cavityHeight * 0.5 + 0.00008, 0]}>
        <boxGeometry args={[keycap.cavityWidth, keycap.cavityHeight, keycap.cavityDepth]} />
        <meshStandardMaterial color={shiftColor(keycap.colors.sideColor, -18)} roughness={Math.min(1, sidePbr.roughness + 0.08)} side={THREE.BackSide} />
      </mesh>

      <mesh position={[0, -keycap.keyHeight / 2 + 0.0009, 0]} castShadow>
        <boxGeometry args={[0.0042, 0.0011, 0.0013]} />
        <meshStandardMaterial color={shiftColor(keycap.colors.sideColor, -22)} roughness={0.62} metalness={0.08} />
      </mesh>
      <mesh position={[0, -keycap.keyHeight / 2 + 0.0009, 0]} castShadow>
        <boxGeometry args={[0.0013, 0.0011, 0.0042]} />
        <meshStandardMaterial color={shiftColor(keycap.colors.sideColor, -22)} roughness={0.62} metalness={0.08} />
      </mesh>
    </group>
  )
}

/**
 * 键帽阵列：持续旋转并展示多种尺寸（含 6.25U 空格）。
 */
function RotatingKeycapSet({ zone }: { zone: KeycapZoneConfig }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (!groupRef.current) {
      return
    }

    groupRef.current.rotation.y += delta * 0.36
    groupRef.current.rotation.x = -0.08 + Math.sin(state.clock.elapsedTime * 0.6) * 0.03
  })

  const rowOnePositions = useMemo(() => {
    const spacingU = 0.38
    const totalUnits = PREVIEW_SIZES_ROW_ONE.reduce((sum, size) => sum + size, 0) + spacingU * (PREVIEW_SIZES_ROW_ONE.length - 1)
    let cursor = -totalUnits / 2
    return PREVIEW_SIZES_ROW_ONE.map((size) => {
      const center = cursor + size / 2
      cursor += size + spacingU
      return center * UNIT_SIZE
    })
  }, [])

  return (
    <group ref={groupRef} position={[0, -0.004, 0]}>
      {PREVIEW_SIZES_ROW_ONE.map((size, index) => (
        <PreviewKeycap key={`row1-${size}`} zone={zone} sizeU={size} position={[rowOnePositions[index], 0.0128, -0.012]} />
      ))}
      {PREVIEW_SIZES_ROW_TWO.map((size) => (
        <PreviewKeycap key={`row2-${size}`} zone={zone} sizeU={size} position={[0, 0.0128, 0.038]} />
      ))}
    </group>
  )
}

/**
 * 高保真键帽旋转预览容器。
 */
export function KeycapTurntable({ keycapZone, className }: KeycapTurntableProps) {
  return (
    <Canvas
      className={className}
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [0, 0.115, 0.285], fov: 34 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.18,
      }}
    >
      <color attach="background" args={['#09192c']} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[0.46, 0.52, 0.24]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-0.44, 0.3, -0.26]} intensity={0.52} />
      <pointLight position={[0, 0.18, 0.14]} intensity={0.2} color="#d7ebff" />

      <Suspense fallback={null}>
        <RotatingKeycapSet zone={keycapZone} />
      </Suspense>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[0.48, 0.32]} />
        <meshStandardMaterial color="#11243a" roughness={0.88} metalness={0.04} />
      </mesh>
      <ContactShadows position={[0, -0.0004, 0]} opacity={0.35} scale={0.58} blur={2.2} far={0.18} />
      <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2.8} maxPolarAngle={Math.PI / 2.05} />
    </Canvas>
  )
}

export default KeycapTurntable
