'use client'

import { useEffect, useState } from 'react'
import { useKeyboardStore } from '@/store/useKeyboardStore'
import styles from './VisualFeedbackOverlay.module.css'

/**
 * Floating overlay that surfaces the latest parameter update in under 150ms.
 */
export function VisualFeedbackOverlay() {
  const incomingEvent = useKeyboardStore((state) => state.lastVisualEvent)
  const [activeEvent, setActiveEvent] = useState(incomingEvent)
  const [visible, setVisible] = useState(Boolean(incomingEvent))

  useEffect(() => {
    if (!incomingEvent) {
      return
    }

    setActiveEvent(incomingEvent)
    setVisible(true)

    const hideTimer = window.setTimeout(() => {
      setVisible(false)
    }, 2000)

    return () => {
      window.clearTimeout(hideTimer)
    }
  }, [incomingEvent])

  if (!activeEvent) {
    return null
  }

  const badgeLabel = activeEvent.kind === 'summary' ? 'SUMMARY' : 'UPDATED'

  return (
    <aside className={`${styles.overlay} ${visible ? '' : styles.overlayHidden}`}>
      <div className={styles.header}>
        <span className={styles.title}>Visual Feedback</span>
        <span className={styles.badge}>{badgeLabel}</span>
      </div>

      <div className={styles.line}>
        <span className={styles.label}>{activeEvent.label}</span>
        <span className={styles.value}>{activeEvent.value || '-'}</span>
      </div>

      <p className={styles.effect}>{activeEvent.effect}</p>
    </aside>
  )
}

export default VisualFeedbackOverlay
