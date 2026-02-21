'use client'

import { useMemo } from 'react'
import { useKeyboardStore } from '@/store/useKeyboardStore'
import { KeycapZone } from '@/types/keyboard'
import { SwitchCrossSection } from './SwitchCrossSection'
import { KeycapThreeView } from './KeycapThreeView'
import styles from './SwitchBlueprintDock.module.css'

interface SwitchBlueprintDockProps {
  zone: KeycapZone
}

function formatZone(zone: KeycapZone): string {
  if (zone === 'alpha') return 'ALPHA'
  if (zone === 'modifier') return 'MODIFIER'
  if (zone === 'function') return 'FUNCTION'
  if (zone === 'nav') return 'NAV'
  if (zone === 'numpad') return 'NUMPAD'
  return 'SPACE'
}

/**
 * 右侧固定剖面图面板：
 * 提供调参过程中的实时机械剖面反馈，不需要在控制面板中来回滚动查阅。
 */
export function SwitchBlueprintDock({ zone }: SwitchBlueprintDockProps) {
  const switches = useKeyboardStore((state) => state.switches)
  const zones = useKeyboardStore((state) => state.keycaps.zones)
  const zoneConfig = zones[zone] ?? zones.alpha

  const subtitle = useMemo(() => {
    return `当前分区：${formatZone(zone)} · Profile: ${zoneConfig.profile.toUpperCase()} · 材质: ${zoneConfig.material.toUpperCase()}`
  }, [zone, zoneConfig.material, zoneConfig.profile])

  return (
    <aside className={styles.dock}>
      <header className={styles.header}>
        <h2 className={styles.title}>机械图纸面板 (Blueprint Dock)</h2>
        <p className={styles.subtitle}>{subtitle}</p>
        <span className={styles.zoneTag}>ZONE {formatZone(zone)}</span>
      </header>

      <div className={styles.sections}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>键帽三视图 (Orthographic)</h3>
          </div>
          <div className={styles.body}>
            <KeycapThreeView keycapZone={zoneConfig} />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>轴体剖面图 (Cross Section)</h3>
          </div>
          <div className={styles.body}>
            <SwitchCrossSection switches={switches} keycapZone={zoneConfig} />
          </div>
        </section>
      </div>
    </aside>
  )
}

export default SwitchBlueprintDock
