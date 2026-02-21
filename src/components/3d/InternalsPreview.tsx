'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { InternalsConfig } from '@/types/keyboard'

interface InternalsPreviewProps {
  config: InternalsConfig
  width: number
  depth: number
  previewActive: boolean
}

const PLATE_COLORS: Record<InternalsConfig['plateMaterial'], string> = {
  alu: '#bcc3cf',
  brass: '#c7a440',
  pc: '#9fb6d0',
  fr4: '#587c4f',
  pom: '#dcdfe3',
  carbon: '#2e2e2e',
  ppe: '#a8c0b2',
}

/**
 * Visual-only cutaway stack for internals and mod layers.
 */
export function InternalsPreview({ config, width, depth, previewActive }: InternalsPreviewProps) {
  const progress = useRef(previewActive ? 1 : 0)

  useFrame((_, delta) => {
    const target = previewActive ? 1 : 0
    progress.current = THREE.MathUtils.lerp(progress.current, target, delta * 6)
  })

  const splitOffset = THREE.MathUtils.lerp(0, 0.013, progress.current)
  const opacity = THREE.MathUtils.lerp(0.1, 0.72, progress.current)

  const tapeStripes = useMemo(() => Array.from({ length: Math.max(0, Math.floor(config.mods.tapeMod)) }), [config.mods.tapeMod])

  const plateRoughness = config.plateMaterial === 'brass' ? 0.35 : config.plateMaterial === 'carbon' ? 0.55 : 0.45

  return (
    <group position={[0, -0.006 - splitOffset, 0]}>
      <mesh>
        <boxGeometry args={[width * 0.91, 0.0018, depth * 0.86]} />
        <meshStandardMaterial color={PLATE_COLORS[config.plateMaterial]} roughness={plateRoughness} metalness={0.25} transparent opacity={opacity} />
      </mesh>

      {config.plateFlexCuts && (
        <group>
          {[-0.2, -0.08, 0.08, 0.2].map((x) => (
            <mesh key={x} position={[width * x, 0.0001, 0]}>
              <boxGeometry args={[0.0038, 0.0022, depth * 0.55]} />
              <meshBasicMaterial color="#0a0a0a" transparent opacity={opacity * 0.88} />
            </mesh>
          ))}
        </group>
      )}

      {config.foams.plateFoam && (
        <mesh position={[0, -0.0014, 0]}>
          <boxGeometry args={[width * 0.9, 0.001, depth * 0.84]} />
          <meshStandardMaterial color="#ffe6a3" roughness={0.8} metalness={0.03} transparent opacity={opacity * 0.9} />
        </mesh>
      )}

      {config.foams.peSheet && (
        <mesh position={[0, -0.0023, 0]}>
          <boxGeometry args={[width * 0.88, 0.0006, depth * 0.82]} />
          <meshStandardMaterial color="#d5ecff" roughness={0.3} metalness={0.04} transparent opacity={opacity * 0.85} />
        </mesh>
      )}

      {config.foams.ixpe && (
        <mesh position={[0, -0.0032, 0]}>
          <boxGeometry args={[width * 0.87, 0.0006, depth * 0.81]} />
          <meshStandardMaterial color="#ffd4ef" roughness={0.48} metalness={0.03} transparent opacity={opacity * 0.82} />
        </mesh>
      )}

      {config.mods.peFoamMod && (
        <mesh position={[0, -0.004, 0]}>
          <boxGeometry args={[width * 0.84, 0.0007, depth * 0.78]} />
          <meshStandardMaterial color="#e2ffcf" roughness={0.72} metalness={0.02} transparent opacity={opacity * 0.86} />
        </mesh>
      )}

      {config.foams.caseFoam && (
        <mesh position={[0, -0.0049, 0]}>
          <boxGeometry args={[width * 0.93, 0.0012, depth * 0.88]} />
          <meshStandardMaterial color="#b1a88f" roughness={0.82} metalness={0.02} transparent opacity={opacity * 0.88} />
        </mesh>
      )}

      {config.foams.spacebarFoam && (
        <mesh position={[0, -0.0003, depth * 0.2]}>
          <boxGeometry args={[width * 0.26, 0.0008, depth * 0.12]} />
          <meshStandardMaterial color="#f4d7b4" roughness={0.82} metalness={0.01} transparent opacity={opacity * 0.92} />
        </mesh>
      )}

      {tapeStripes.length > 0 && (
        <group position={[0, -0.0061, 0]}>
          {tapeStripes.map((_, index) => {
            const ratio = tapeStripes.length === 1 ? 0 : index / (tapeStripes.length - 1)
            const z = THREE.MathUtils.lerp(-depth * 0.24, depth * 0.24, ratio)
            return (
              <mesh key={index} position={[0, 0, z]}>
                <boxGeometry args={[width * 0.78, 0.0003, 0.0032]} />
                <meshBasicMaterial color="#74d0ff" transparent opacity={Math.min(0.95, opacity)} />
              </mesh>
            )
          })}
        </group>
      )}

      {config.mods.holeeMod && (
        <group position={[0, -0.001, depth * 0.19]}>
          {[-0.28, 0, 0.28].map((x) => (
            <mesh key={x} position={[width * x, 0, 0]}>
              <boxGeometry args={[0.006, 0.001, 0.002]} />
              <meshStandardMaterial color="#c8f58a" roughness={0.52} metalness={0.05} transparent opacity={opacity} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

export default InternalsPreview
