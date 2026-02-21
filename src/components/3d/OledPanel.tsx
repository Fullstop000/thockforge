'use client'

import { useEffect, useMemo, useState } from 'react'
import { Text } from '@react-three/drei'
import { ModulesConfig, TypingTestState } from '@/types/keyboard'

interface OledPanelProps {
  modules: ModulesConfig
  typingTest: TypingTestState
  caseWidth: number
  caseDepth: number
}

/**
 * Lightweight OLED preview tied to `modules.oled` settings.
 */
export function OledPanel({ modules, typingTest, caseWidth, caseDepth }: OledPanelProps) {
  const [clockText, setClockText] = useState('00:00')

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      setClockText(`${hh}:${mm}`)
    }

    updateClock()
    const timer = window.setInterval(updateClock, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  const displayText = useMemo(() => {
    switch (modules.oled.display) {
      case 'wpm':
        return `${Math.round(typingTest.wpm)} WPM`
      case 'time':
        return clockText
      case 'gif':
        return 'GIF PREVIEW'
      case 'custom':
        return 'CUSTOM HUD'
      default:
        return 'OLED'
    }
  }, [clockText, modules.oled.display, typingTest.wpm])

  const panelPosition = useMemo<[number, number, number]>(() => {
    if (modules.oled.position === 'top_left') {
      return [-caseWidth * 0.28, 0.019, -caseDepth * 0.18]
    }
    if (modules.oled.position === 'center') {
      return [0, 0.019, -caseDepth * 0.2]
    }
    return [caseWidth * 0.28, 0.019, -caseDepth * 0.18]
  }, [caseDepth, caseWidth, modules.oled.position])

  if (!modules.oled.enabled) {
    return null
  }

  return (
    <group position={panelPosition} rotation={[-0.18, 0.04, 0]}>
      <mesh>
        <boxGeometry args={[0.036, 0.003, 0.017]} />
        <meshStandardMaterial color="#20262f" roughness={0.55} metalness={0.22} />
      </mesh>

      <mesh position={[0, 0.0019, 0]}>
        <boxGeometry args={[0.032, 0.0004, 0.0135]} />
        <meshBasicMaterial color="#8df7ff" transparent opacity={0.16} />
      </mesh>

      <Text
        position={[0, 0.0024, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.0028}
        color="#d4fbff"
        anchorX="center"
        anchorY="middle"
      >
        {displayText}
      </Text>
    </group>
  )
}

export default OledPanel
