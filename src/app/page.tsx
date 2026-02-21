'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { ControlPanel } from '@/components/ui/ControlPanel'
import { SwitchBlueprintDock } from '@/components/ui/SwitchBlueprintDock'
import { VisualFeedbackOverlay } from '@/components/ui/VisualFeedbackOverlay'
import { KeycapZone } from '@/types/keyboard'
import '@/components/ui/ControlPanel.css'
import styles from './page.module.css'

const KeyboardScene = dynamic(
  () => import('@/components/3d/KeyboardScene'),
  { 
    ssr: false,
    loading: () => (
      <div className={styles.loadingOverlay}>
        <div className={styles.loadingSpinner} />
      </div>
    )
  }
)

export default function Home() {
  const [selectedKeycapZone, setSelectedKeycapZone] = useState<KeycapZone>('alpha')

  return (
    <main className={styles.mainContainer}>
      <ControlPanel selectedKeycapZone={selectedKeycapZone} onSelectedKeycapZoneChange={setSelectedKeycapZone} />
      <div className={styles.canvasContainer}>
        <VisualFeedbackOverlay />
        <KeyboardScene />
        <div className={styles.infoOverlay}>
          <kbd>拖拽</kbd> 旋转视角 · <kbd>滚轮</kbd> 缩放 · <kbd>点击按键</kbd> 触发声效
        </div>
      </div>
      <SwitchBlueprintDock zone={selectedKeycapZone} />
    </main>
  )
}
