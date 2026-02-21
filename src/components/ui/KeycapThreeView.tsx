'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import { KeycapZoneConfig } from '@/types/keyboard'
import { resolveProfileBlueprintGeometry } from '@/engine/deriveRenderParams'
import styles from './KeycapThreeView.module.css'

const KeycapTurntable = dynamic(() => import('./KeycapTurntable'), {
  ssr: false,
  loading: () => <div className={styles.previewLoading}>正在加载 3D 预览...</div>,
})

interface KeycapThreeViewProps {
  keycapZone: KeycapZoneConfig
}

function formatLegendPosition(position: KeycapZoneConfig['legendPosition']): string {
  if (position === 'center') return '中置正刻'
  if (position === 'top_left') return '左上正刻'
  if (position === 'front_side') return '前侧刻'
  return '侧面透光'
}

/**
 * 键帽三视图（上视 / 正视 / 侧视）。
 * 右侧工程面板的上半区使用它来反馈键帽参数变化。
 */
export function KeycapThreeView({ keycapZone }: KeycapThreeViewProps) {
  const geometry = useMemo(() => resolveProfileBlueprintGeometry(keycapZone), [keycapZone])
  const [showPreview, setShowPreview] = useState(false)
  const calloutColor = '#a8e9ff'
  const lineColor = '#d4f6ff'
  const sideThicknessPx = Math.max(4, Math.min(14, keycapZone.thickness.sideMm * 7))
  const topThicknessPx = Math.max(3, Math.min(12, keycapZone.thickness.topMm * 5.6))

  const topWidth = 148
  const topInnerWidth = topWidth * geometry.topWidthScale
  const topInset = (topWidth - topInnerWidth) / 2
  const bodyHeight = Math.round(geometry.heightMm * 7.5)
  const topY = 186 - bodyHeight

  return (
    <div className={styles.wrapper}>
      <h4 className={styles.title}>Keycap Orthographic Blueprint</h4>
      <svg className={styles.canvas} viewBox="0 0 760 360" role="img" aria-label="键帽三视图机械图">
        <defs>
          <marker
            id="arrow-keycap-blueprint"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={calloutColor} />
          </marker>
        </defs>

        <rect x="0" y="0" width="760" height="360" fill="transparent" />
        <text x="62" y="42" fill={calloutColor} fontSize="12" fontFamily="'SF Mono','Monaco',monospace">
          TOP VIEW
        </text>
        <text x="308" y="42" fill={calloutColor} fontSize="12" fontFamily="'SF Mono','Monaco',monospace">
          FRONT VIEW
        </text>
        <text x="560" y="42" fill={calloutColor} fontSize="12" fontFamily="'SF Mono','Monaco',monospace">
          SIDE VIEW
        </text>

        <rect x="56" y="72" width="172" height="172" fill="none" stroke={lineColor} strokeWidth="1.7" />
        <rect x={56 + topInset} y={72 + topInset} width={topInnerWidth} height={172 - topInset * 2} fill="none" stroke={lineColor} strokeWidth="1.4" />
        <ellipse cx="142" cy="158" rx="38" ry="16" fill="none" stroke="#9af2cd" strokeWidth="1.2" strokeDasharray="4 3" />

        <line x1="224" y1="158" x2="274" y2="136" stroke={calloutColor} strokeWidth="1.1" />
        <text x="280" y="134" fill={calloutColor} fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
          DISH {geometry.dishMm.toFixed(2)}mm
        </text>

        <rect x="300" y={topY} width={148} height={bodyHeight} fill="none" stroke={lineColor} strokeWidth="2" />
        <path
          d={`M ${300 + topInset} ${topY + topThicknessPx} L ${300 + topWidth - topInset} ${topY + topThicknessPx} L ${300 + topWidth - topInset - 8} ${topY + topThicknessPx + 8} L ${300 + topInset + 8} ${topY + topThicknessPx + 8} Z`}
          fill="none"
          stroke="#9af2cd"
          strokeWidth="1.2"
          strokeDasharray="4 3"
        />

        <line
          x1="466"
          y1={topY}
          x2="466"
          y2={186}
          stroke={calloutColor}
          strokeWidth="1.2"
          markerStart="url(#arrow-keycap-blueprint)"
          markerEnd="url(#arrow-keycap-blueprint)"
        />
        <line x1="448" y1={topY} x2="466" y2={topY} stroke={calloutColor} strokeWidth="1.1" />
        <line x1="448" y1={186} x2="466" y2={186} stroke={calloutColor} strokeWidth="1.1" />
        <text x="474" y={(topY + 186) / 2 + 4} fill={calloutColor} fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
          H {geometry.heightMm.toFixed(2)}mm
        </text>

        <line
          x1="382"
          y1={topY + topThicknessPx}
          x2="382"
          y2={topY + topThicknessPx + topThicknessPx}
          stroke={calloutColor}
          strokeWidth="1.2"
          markerStart="url(#arrow-keycap-blueprint)"
          markerEnd="url(#arrow-keycap-blueprint)"
        />
        <text x="390" y={topY + topThicknessPx + topThicknessPx + 12} fill={calloutColor} fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
          TOP {keycapZone.thickness.topMm.toFixed(2)}mm
        </text>

        <path
          d={`M 560 186 L 690 186 L 678 ${186 - bodyHeight} L 572 ${186 - bodyHeight + 10} Z`}
          fill="none"
          stroke={lineColor}
          strokeWidth="2"
        />
        <path
          d={`M ${572 + sideThicknessPx} ${186 - bodyHeight + 12} L ${678 - sideThicknessPx} ${186 - bodyHeight + 2} L ${690 - sideThicknessPx} ${186 - sideThicknessPx} L ${560 + sideThicknessPx} ${186 - sideThicknessPx} Z`}
          fill="none"
          stroke="#9af2cd"
          strokeWidth="1.2"
          strokeDasharray="4 3"
        />

        <line x1="634" y1={186 - bodyHeight + 10} x2="724" y2={186 - bodyHeight - 16} stroke={calloutColor} strokeWidth="1.1" />
        <text x="606" y={186 - bodyHeight - 22} fill={calloutColor} fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
          SLOPE {geometry.frontSlopeDeg.toFixed(1)}°
        </text>

        <line
          x1="546"
          y1={186 - sideThicknessPx}
          x2="546"
          y2={186}
          stroke={calloutColor}
          strokeWidth="1.2"
          markerStart="url(#arrow-keycap-blueprint)"
          markerEnd="url(#arrow-keycap-blueprint)"
        />
        <text x="480" y={186 - sideThicknessPx / 2 + 4} fill={calloutColor} fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
          SIDE {keycapZone.thickness.sideMm.toFixed(2)}mm
        </text>

        <line x1="76" y1="260" x2="24" y2="286" stroke={calloutColor} strokeWidth="1.1" />
        <text x="8" y="300" fill={calloutColor} fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
          PROFILE {keycapZone.profile.toUpperCase()}
        </text>

        <line x1="312" y1="204" x2="250" y2="236" stroke={calloutColor} strokeWidth="1.1" />
        <text x="184" y="250" fill={calloutColor} fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
          LEGEND {formatLegendPosition(keycapZone.legendPosition)}
        </text>

        <line x1="620" y1="224" x2="708" y2="254" stroke={calloutColor} strokeWidth="1.1" />
        <text x="612" y="272" fill={calloutColor} fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
          MAT {keycapZone.material.toUpperCase()} / {keycapZone.bodyManufacturing.toUpperCase()}
        </text>
      </svg>

      <p className={styles.desc}>
        三视图实时反映键帽参数：Profile 外形、顶部/侧壁厚度、碟形深度、前后倾角与印字位置都会同步变化。
      </p>

      <div className={styles.specGrid}>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>轮廓 Profile</span>
          <span className={styles.specValue}>{keycapZone.profile.toUpperCase()}</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>字符位置</span>
          <span className={styles.specValue}>{formatLegendPosition(keycapZone.legendPosition)}</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>厚度参数</span>
          <span className={styles.specValue}>
            TOP {keycapZone.thickness.topMm.toFixed(2)} / SIDE {keycapZone.thickness.sideMm.toFixed(2)}mm
          </span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>本体工艺</span>
          <span className={styles.specValue}>
            {keycapZone.material.toUpperCase()} / {keycapZone.bodyManufacturing.toUpperCase()}
          </span>
        </div>
      </div>

      <button type="button" className={styles.previewToggle} onClick={() => setShowPreview((prev) => !prev)}>
        {showPreview ? '隐藏高保真 3D 预览' : '查看高保真 3D 预览'}
      </button>

      {showPreview && (
        <div className={styles.previewPanel}>
          <div className={styles.previewHeader}>
            <span className={styles.previewTitle}>旋转键帽阵列 (Hi-Fi Keycap Turntable)</span>
            <div className={styles.previewSizeRow}>
              <span className={styles.previewSizeTag}>1U</span>
              <span className={styles.previewSizeTag}>1.25U</span>
              <span className={styles.previewSizeTag}>1.75U</span>
              <span className={styles.previewSizeTag}>2.25U</span>
              <span className={styles.previewSizeTag}>2.75U</span>
              <span className={styles.previewSizeTag}>6.25U</span>
            </div>
          </div>
          <div className={styles.previewCanvasWrap}>
            <KeycapTurntable keycapZone={keycapZone} className={styles.previewCanvas} />
          </div>
          <p className={styles.previewHint}>
            预览会持续旋转，用于检查不同尺寸键帽在当前 Profile、材质和厚度参数下的形体与高光表现。
          </p>
        </div>
      )}
    </div>
  )
}

export default KeycapThreeView
