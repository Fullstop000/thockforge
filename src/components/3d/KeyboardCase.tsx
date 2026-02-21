'use client'

import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { CaseConfig, CaseFinish, CaseMaterial, MountType, WeightFinish } from '@/types/keyboard'

interface KeyboardCaseProps {
  config: CaseConfig
  layoutWidth: number
  layoutDepth: number
}

const MATERIAL_COLORS: Record<CaseMaterial, string> = {
  alu_6063: '#2a2a2a',
  alu_7075: '#1a1a1a',
  pc: '#3a3d44',
  acrylic: '#4b4d57',
  abs: '#2d2d2d',
  wood: '#5c4033',
}

const FINISH_SURFACE: Record<
  CaseFinish,
  {
    metalness: number
    roughness: number
    clearcoat: number
    clearcoatRoughness: number
  }
> = {
  anodized: { metalness: 0.65, roughness: 0.32, clearcoat: 0.28, clearcoatRoughness: 0.45 },
  'e-white': { metalness: 0.18, roughness: 0.56, clearcoat: 0.08, clearcoatRoughness: 0.6 },
  cerakote: { metalness: 0.12, roughness: 0.72, clearcoat: 0.06, clearcoatRoughness: 0.8 },
  powdercoat: { metalness: 0.16, roughness: 0.65, clearcoat: 0.08, clearcoatRoughness: 0.74 },
  polished: { metalness: 0.92, roughness: 0.08, clearcoat: 0.85, clearcoatRoughness: 0.08 },
  beadblasted: { metalness: 0.48, roughness: 0.52, clearcoat: 0.22, clearcoatRoughness: 0.55 },
}

const WEIGHT_FINISH_TINT: Record<WeightFinish, string> = {
  pvd_mirror: '#d7d7d7',
  pvd_brushed: '#b9b9b9',
  beadblasted: '#9f9f9f',
  blued: '#4e6ca8',
  cerakote: '#8b8b8b',
}

/**
 * Main keyboard case mesh and structural indicators.
 */
export function KeyboardCase({ config, layoutWidth, layoutDepth }: KeyboardCaseProps) {
  const caseHeight = 0.035
  const wallThickness = 0.008
  const bottomThickness = 0.0044
  const topLipThickness = 0.0018

  const outerWidth = layoutWidth + wallThickness * 2
  const outerDepth = layoutDepth + wallThickness * 2
  const innerWidth = Math.max(0.01, outerWidth - wallThickness * 2)
  const innerDepth = Math.max(0.01, outerDepth - wallThickness * 2)

  const surface = FINISH_SURFACE[config.finish]

  const weightMaterialProps = useMemo(() => {
    if (!config.weight.enabled) {
      return null
    }

    const baseColor =
      config.weight.material === 'brass'
        ? '#b8860b'
        : config.weight.material === 'stainless'
          ? '#c0c0c0'
          : config.weight.material === 'copper'
            ? '#b87333'
            : '#808080'

    const tint = WEIGHT_FINISH_TINT[config.weight.finish]

    return {
      color: config.weight.finish === 'blued' ? tint : baseColor,
      metalness: config.weight.finish === 'pvd_mirror' ? 1 : 0.78,
      roughness:
        config.weight.finish === 'pvd_mirror' ? 0.05 : config.weight.finish === 'pvd_brushed' ? 0.28 : 0.48,
      clearcoat: config.weight.finish === 'pvd_mirror' ? 0.8 : 0.2,
      clearcoatRoughness: config.weight.finish === 'pvd_mirror' ? 0.1 : 0.4,
    }
  }, [config.weight])

  return (
    <group>
      {/* 开口框体机壳：
          使用底板 + 四面墙，避免实心顶板阻挡键帽下沉行程。 */}
      <RoundedBox
        args={[outerWidth, bottomThickness, outerDepth]}
        radius={0.0028}
        smoothness={4}
        position={[0, -caseHeight / 2 + bottomThickness / 2, 0]}
      >
        <meshPhysicalMaterial
          color={MATERIAL_COLORS[config.material]}
          metalness={surface.metalness}
          roughness={surface.roughness}
          clearcoat={surface.clearcoat}
          clearcoatRoughness={surface.clearcoatRoughness}
          envMapIntensity={1.5}
        />
      </RoundedBox>

      <RoundedBox args={[wallThickness, caseHeight, outerDepth]} radius={0.0018} smoothness={3} position={[-outerWidth / 2 + wallThickness / 2, 0, 0]}>
        <meshPhysicalMaterial
          color={MATERIAL_COLORS[config.material]}
          metalness={surface.metalness}
          roughness={surface.roughness}
          clearcoat={surface.clearcoat}
          clearcoatRoughness={surface.clearcoatRoughness}
          envMapIntensity={1.5}
        />
      </RoundedBox>
      <RoundedBox args={[wallThickness, caseHeight, outerDepth]} radius={0.0018} smoothness={3} position={[outerWidth / 2 - wallThickness / 2, 0, 0]}>
        <meshPhysicalMaterial
          color={MATERIAL_COLORS[config.material]}
          metalness={surface.metalness}
          roughness={surface.roughness}
          clearcoat={surface.clearcoat}
          clearcoatRoughness={surface.clearcoatRoughness}
          envMapIntensity={1.5}
        />
      </RoundedBox>
      <RoundedBox args={[innerWidth, caseHeight, wallThickness]} radius={0.0018} smoothness={3} position={[0, 0, -outerDepth / 2 + wallThickness / 2]}>
        <meshPhysicalMaterial
          color={MATERIAL_COLORS[config.material]}
          metalness={surface.metalness}
          roughness={surface.roughness}
          clearcoat={surface.clearcoat}
          clearcoatRoughness={surface.clearcoatRoughness}
          envMapIntensity={1.5}
        />
      </RoundedBox>
      <RoundedBox args={[innerWidth, caseHeight, wallThickness]} radius={0.0018} smoothness={3} position={[0, 0, outerDepth / 2 - wallThickness / 2]}>
        <meshPhysicalMaterial
          color={MATERIAL_COLORS[config.material]}
          metalness={surface.metalness}
          roughness={surface.roughness}
          clearcoat={surface.clearcoat}
          clearcoatRoughness={surface.clearcoatRoughness}
          envMapIntensity={1.5}
        />
      </RoundedBox>

      <mesh position={[0, caseHeight / 2 - topLipThickness / 2, -outerDepth / 2 + wallThickness * 0.52]}>
        <boxGeometry args={[innerWidth, topLipThickness, wallThickness * 0.8]} />
        <meshStandardMaterial color="#23242a" metalness={0.12} roughness={0.72} />
      </mesh>
      <mesh position={[0, caseHeight / 2 - topLipThickness / 2, outerDepth / 2 - wallThickness * 0.52]}>
        <boxGeometry args={[innerWidth, topLipThickness, wallThickness * 0.8]} />
        <meshStandardMaterial color="#23242a" metalness={0.12} roughness={0.72} />
      </mesh>
      <mesh position={[-outerWidth / 2 + wallThickness * 0.52, caseHeight / 2 - topLipThickness / 2, 0]}>
        <boxGeometry args={[wallThickness * 0.8, topLipThickness, innerDepth]} />
        <meshStandardMaterial color="#23242a" metalness={0.12} roughness={0.72} />
      </mesh>
      <mesh position={[outerWidth / 2 - wallThickness * 0.52, caseHeight / 2 - topLipThickness / 2, 0]}>
        <boxGeometry args={[wallThickness * 0.8, topLipThickness, innerDepth]} />
        <meshStandardMaterial color="#23242a" metalness={0.12} roughness={0.72} />
      </mesh>

      <MountVisuals mount={config.mount} width={outerWidth} depth={outerDepth} caseHeight={caseHeight} />

      {config.weight.enabled && weightMaterialProps && (
        <mesh position={[0, -caseHeight / 2 - 0.005, outerDepth * 0.3]} rotation={[Math.PI, 0, 0]}>
          <boxGeometry args={[outerWidth * 0.6, 0.01, outerDepth * 0.35]} />
          <meshPhysicalMaterial {...weightMaterialProps} />
        </mesh>
      )}

      <ScrewArray
        width={outerWidth}
        depth={outerDepth}
        finish={config.screws.finish}
        screwType={config.screws.type}
        caseHeight={caseHeight}
      />
    </group>
  )
}

function MountVisuals({
  mount,
  width,
  depth,
  caseHeight,
}: {
  mount: MountType
  width: number
  depth: number
  caseHeight: number
}) {
  const mountColor =
    mount === 'gasket_poron'
      ? '#7df2b6'
      : mount === 'gasket_silicone'
        ? '#79d7ff'
        : mount === 'top'
          ? '#ffd178'
          : mount === 'tray'
            ? '#ffb3b3'
            : mount === 'oring_burger'
              ? '#c6b6ff'
              : '#9aa0a6'

  if (mount === 'plateless') {
    return (
      <mesh position={[0, caseHeight / 2 + 0.0012, 0]}>
        <boxGeometry args={[width * 0.7, 0.0006, depth * 0.6]} />
        <meshBasicMaterial color={mountColor} transparent opacity={0.65} />
      </mesh>
    )
  }

  if (mount === 'oring_burger') {
    return (
      <group>
        {[-0.24, 0.24].map((x) => (
          <mesh key={x} position={[width * x, 0, depth * 0.34]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.006, 0.0013, 10, 20]} />
            <meshStandardMaterial color={mountColor} roughness={0.4} metalness={0.1} />
          </mesh>
        ))}
      </group>
    )
  }

  if (mount === 'top') {
    return (
      <group>
        {[-0.38, 0, 0.38].map((x) => (
          <mesh key={x} position={[width * x, caseHeight / 2 - 0.001, -depth * 0.42]}>
            <boxGeometry args={[0.003, 0.005, 0.003]} />
            <meshStandardMaterial color={mountColor} roughness={0.35} metalness={0.12} />
          </mesh>
        ))}
      </group>
    )
  }

  if (mount === 'tray') {
    return (
      <group>
        {[-0.35, -0.12, 0.12, 0.35].map((x) => (
          <mesh key={x} position={[width * x, -caseHeight / 2 + 0.004, 0]}>
            <boxGeometry args={[0.0032, 0.007, 0.0032]} />
            <meshStandardMaterial color={mountColor} roughness={0.3} metalness={0.2} />
          </mesh>
        ))}
      </group>
    )
  }

  return (
    <group>
      <mesh position={[0, caseHeight / 2 - 0.003, depth * 0.44]}>
        <boxGeometry args={[width * 0.82, 0.0012, 0.002]} />
        <meshStandardMaterial color={mountColor} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, caseHeight / 2 - 0.003, -depth * 0.44]}>
        <boxGeometry args={[width * 0.82, 0.0012, 0.002]} />
        <meshStandardMaterial color={mountColor} roughness={0.55} metalness={0.05} />
      </mesh>
    </group>
  )
}

function ScrewArray({
  width,
  depth,
  finish,
  screwType,
  caseHeight,
}: {
  width: number
  depth: number
  finish: string
  screwType: CaseConfig['screws']['type']
  caseHeight: number
}) {
  const screwColor = finish === 'gold' ? '#ffd700' : finish === 'titanium_blued' ? '#4169e1' : '#c0c0c0'

  const positions: [number, number, number][] = [
    [-width * 0.45, caseHeight / 2 + 0.001, -depth * 0.45],
    [width * 0.45, caseHeight / 2 + 0.001, -depth * 0.45],
    [-width * 0.45, caseHeight / 2 + 0.001, depth * 0.45],
    [width * 0.45, caseHeight / 2 + 0.001, depth * 0.45],
  ]

  return (
    <>
      {positions.map((pos, index) => (
        <group key={index} position={pos} rotation={[Math.PI / 2, 0, 0]}>
          {screwType === 'hex' ? (
            <mesh>
              <cylinderGeometry args={[0.002, 0.002, 0.003, 6]} />
              <meshStandardMaterial color={screwColor} metalness={0.9} roughness={0.2} />
            </mesh>
          ) : (
            <>
              <mesh position={[0, 0, -0.0008]}>
                <cylinderGeometry args={[0.002, 0.002, 0.0015, 18]} />
                <meshStandardMaterial color={screwColor} metalness={0.88} roughness={0.22} />
              </mesh>
              <mesh position={[0, 0, 0.0004]}>
                <coneGeometry args={[0.002, 0.0015, 18]} />
                <meshStandardMaterial color={screwColor} metalness={0.88} roughness={0.26} />
              </mesh>
            </>
          )}
        </group>
      ))}
    </>
  )
}

export default KeyboardCase
