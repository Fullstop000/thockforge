'use client'

import { useMemo } from 'react'
import { KeycapZoneConfig, SwitchConfig } from '@/types/keyboard'
import { resolveSwitchBlueprintMetrics } from '@/engine/deriveRenderParams'
import styles from './SwitchCrossSection.module.css'

interface SwitchCrossSectionProps {
  switches: SwitchConfig
  keycapZone: KeycapZoneConfig
}

/**
 * 生成弹簧折线路径，用于 2D 图纸风格展示圈数和压缩状态。
 */
function buildSpringPath(centerX: number, yTop: number, yBottom: number, coils: number, amplitude: number): string {
  const points: Array<{ x: number; y: number }> = [{ x: centerX, y: yTop }]
  const steps = Math.max(4, coils * 2)
  const stepY = (yBottom - yTop) / steps

  for (let i = 1; i <= steps; i += 1) {
    const x = i % 2 === 0 ? centerX - amplitude : centerX + amplitude
    points.push({ x, y: yTop + stepY * i })
  }

  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ')
}

function formatSwitchType(type: SwitchConfig['type']): string {
  if (type === 'linear') return '线性 (Linear)'
  if (type === 'tactile') return '段落 (Tactile)'
  if (type === 'clicky') return '有声段落 (Clicky)'
  return '静音 (Silent)'
}

function formatSpringType(type: SwitchConfig['springType']): string {
  if (type === 'single') return '单段弹簧'
  if (type === 'extended') return '加长弹簧'
  return '渐进弹簧'
}

function formatLube(type: SwitchConfig['lube']): string {
  if (type === 'stock') return '无润'
  if (type === 'factory') return '厂润'
  if (type === 'hand_lubed_thin') return '手工薄润'
  return '手工厚润'
}

function formatFilm(type: SwitchConfig['film']): string {
  if (type === 'none') return '无'
  if (type === 'pc') return 'PC 膜'
  if (type === 'pom') return 'POM 膜'
  return 'PET 膜'
}

function formatStabilizer(type: SwitchConfig['stabilizerQuality']): string {
  if (type === 'perfect') return '完美调教'
  if (type === 'minor_rattle') return '轻微钢丝音'
  return '明显钢丝音'
}

/**
 * 轴体机械剖面图（2D）：
 * 右侧面板固定展示，用图纸风格标注关键尺寸，调参时实时响应。
 */
export function SwitchCrossSection({ switches, keycapZone }: SwitchCrossSectionProps) {
  const metrics = useMemo(() => resolveSwitchBlueprintMetrics(switches), [switches])

  const topMaterialLabel = switches.materials.top.toUpperCase()
  const stemMaterialLabel = switches.materials.stem.toUpperCase()
  const bottomMaterialLabel = switches.materials.bottom.toUpperCase()

  const keycapTopThicknessMm = keycapZone.thickness.topMm
  const keycapSideThicknessMm = keycapZone.thickness.sideMm
  const keycapProfileLabel = keycapZone.profile.toUpperCase()

  const pxPerMm = 10
  const stemRestTopY = 170
  const stemBottomTopY = stemRestTopY + metrics.totalTravelMm * pxPerMm

  const springCenterX = 330
  const springTopY = 262
  const springBottomY = 352
  const springPath = buildSpringPath(springCenterX, springTopY, springBottomY, metrics.springCoils, 13)
  const compressedSpringTop = springTopY + metrics.totalTravelMm * pxPerMm * 0.65
  const compressedSpringPath = buildSpringPath(
    springCenterX,
    compressedSpringTop,
    springBottomY,
    Math.max(12, Math.round(metrics.springCoils * 0.8)),
    10
  )

  const calloutColor = '#a8e9ff'
  const bodyLineColor = '#d4f6ff'

  return (
    <div className={styles.wrapper}>
      <h4 className={styles.title}>Switch Cross Section Blueprint</h4>
      <svg className={styles.canvas} viewBox="0 0 760 460" role="img" aria-label="轴体剖面机械图">
        <defs>
          <marker
            id="arrow-blueprint"
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

        <rect x="0" y="0" width="760" height="460" fill="transparent" />

        <path d="M 190 100 L 470 100 L 438 148 L 222 148 Z" fill="none" stroke={bodyLineColor} strokeWidth="2.2" />
        <path d="M 222 148 L 438 148 L 424 176 L 236 176 Z" fill="none" stroke={bodyLineColor} strokeWidth="1.8" strokeDasharray="5 4" />

        <rect x="274" y={stemRestTopY} width="112" height="26" fill="none" stroke={bodyLineColor} strokeWidth="1.8" />
        <rect x="288" y={stemRestTopY + 26} width="84" height="25" fill="none" stroke={bodyLineColor} strokeWidth="1.8" />
        <rect x="302" y={stemRestTopY + 6} width="56" height="8" fill="none" stroke="#9af2cd" strokeWidth="1.3" />

        <rect x="244" y="220" width="172" height="50" fill="none" stroke={bodyLineColor} strokeWidth="2" />
        <rect x="234" y="270" width="192" height="102" fill="none" stroke={bodyLineColor} strokeWidth="2" />

        <line x1="266" y1="270" x2="266" y2="372" stroke={bodyLineColor} strokeWidth="1.4" />
        <line x1="394" y1="270" x2="394" y2="372" stroke={bodyLineColor} strokeWidth="1.4" />

        <path d={springPath} fill="none" stroke={bodyLineColor} strokeWidth="1.5" />
        <path d={compressedSpringPath} fill="none" stroke="#8be9c5" strokeWidth="1.2" strokeDasharray="4 3" />

        <rect x="318" y={stemBottomTopY} width="24" height="98" fill="none" stroke="#8be9c5" strokeWidth="1.5" strokeDasharray="4 3" />

        {switches.orings.enabled && <ellipse cx="330" cy={stemRestTopY + 10} rx="15" ry="4.8" fill="none" stroke="#9df7c5" strokeWidth="1.8" />}

        {switches.type === 'clicky' && (
          <>
            <rect x="370" y="208" width="16" height="24" fill="none" stroke="#ffd88b" strokeWidth="1.5" />
            <line x1="370" y1="220" x2="386" y2="214" stroke="#ffd88b" strokeWidth="1.3" />
          </>
        )}

        {switches.type === 'tactile' && (
          <>
            <rect x="380" y="232" width="7" height="28" fill="none" stroke="#f4ca7a" strokeWidth="1.4" />
            <line x1="380" y1="248" x2="393" y2="242" stroke="#f4ca7a" strokeWidth="1.2" />
          </>
        )}

        {switches.type === 'silent' && (
          <>
            <rect x="308" y="220" width="44" height="3.6" fill="none" stroke="#b9c3cf" strokeWidth="1.4" />
            <rect x="308" y="368" width="44" height="3.6" fill="none" stroke="#b9c3cf" strokeWidth="1.4" />
          </>
        )}

        {switches.film !== 'none' && (
          <>
            <line x1="244" y1="270" x2="416" y2="270" stroke="#ffdca0" strokeWidth="1.1" strokeDasharray="3 3" />
            <line x1="244" y1="220" x2="416" y2="220" stroke="#ffdca0" strokeWidth="1.1" strokeDasharray="3 3" />
          </>
        )}

        <line
          x1="560"
          y1={stemRestTopY}
          x2="560"
          y2={stemBottomTopY}
          stroke={calloutColor}
          strokeWidth="1.3"
          markerStart="url(#arrow-blueprint)"
          markerEnd="url(#arrow-blueprint)"
        />
        <line x1="386" y1={stemRestTopY} x2="560" y2={stemRestTopY} stroke={calloutColor} strokeWidth="1.1" />
        <line x1="342" y1={stemBottomTopY} x2="560" y2={stemBottomTopY} stroke={calloutColor} strokeWidth="1.1" />
        <text x="568" y={(stemRestTopY + stemBottomTopY) / 2 + 4} fill={calloutColor} fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
          TOTAL {metrics.totalTravelMm.toFixed(2)}mm
        </text>

        <line x1="156" y1="220" x2="156" y2="270" stroke={calloutColor} strokeWidth="1.3" markerStart="url(#arrow-blueprint)" markerEnd="url(#arrow-blueprint)" />
        <line x1="156" y1="220" x2="244" y2="220" stroke={calloutColor} strokeWidth="1.1" />
        <line x1="156" y1="270" x2="244" y2="270" stroke={calloutColor} strokeWidth="1.1" />
        <text x="38" y="248" fill={calloutColor} fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
          PRE {metrics.preTravelMm.toFixed(2)}mm
        </text>

        <line x1="492" y1="102" x2="492" y2="176" stroke={calloutColor} strokeWidth="1.3" markerStart="url(#arrow-blueprint)" markerEnd="url(#arrow-blueprint)" />
        <line x1="470" y1="100" x2="492" y2="100" stroke={calloutColor} strokeWidth="1.1" />
        <line x1="438" y1="148" x2="492" y2="148" stroke={calloutColor} strokeWidth="1.1" />
        <text x="500" y="126" fill={calloutColor} fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
          TOP {keycapTopThicknessMm.toFixed(2)}mm
        </text>

        <line x1="178" y1="106" x2="106" y2="82" stroke={calloutColor} strokeWidth="1.1" />
        <text x="20" y="76" fill={calloutColor} fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
          PROFILE {keycapProfileLabel}
        </text>
        <text x="20" y="92" fill={calloutColor} fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
          SIDE {keycapSideThicknessMm.toFixed(2)}mm
        </text>

        <line x1="347" y1="308" x2="460" y2="284" stroke={calloutColor} strokeWidth="1.1" />
        <text x="468" y="282" fill={calloutColor} fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
          SPRING Lf {metrics.springFreeLengthMm.toFixed(1)} / Lc {metrics.springCompressedMm.toFixed(1)}mm
        </text>

        <line x1="347" y1="326" x2="460" y2="324" stroke={calloutColor} strokeWidth="1.1" />
        <text x="468" y="328" fill={calloutColor} fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
          COILS {metrics.springCoils} / WIRE {metrics.springWireDiaMm.toFixed(2)}mm / OD {metrics.springOuterDiaMm.toFixed(1)}mm
        </text>

        <line x1="286" y1="182" x2="190" y2="164" stroke={calloutColor} strokeWidth="1.1" />
        <text x="30" y="160" fill={calloutColor} fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
          TOP HOUSING {topMaterialLabel}
        </text>

        <line x1="292" y1="204" x2="190" y2="202" stroke={calloutColor} strokeWidth="1.1" />
        <text x="30" y="206" fill={calloutColor} fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
          STEM {stemMaterialLabel}
        </text>

        <line x1="234" y1="350" x2="146" y2="378" stroke={calloutColor} strokeWidth="1.1" />
        <text x="16" y="388" fill={calloutColor} fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
          BOTTOM HOUSING {bottomMaterialLabel}
        </text>

        <line x1="418" y1="234" x2="552" y2="206" stroke={calloutColor} strokeWidth="1.1" />
        <text x="560" y="202" fill={calloutColor} fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
          SPRING {switches.springWeight}g / {formatSpringType(switches.springType)}
        </text>

        <line x1="418" y1="258" x2="552" y2="248" stroke={calloutColor} strokeWidth="1.1" />
        <text x="560" y="252" fill={calloutColor} fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
          TYPE {formatSwitchType(switches.type)}
        </text>

        <line x1="418" y1="278" x2="552" y2="288" stroke={calloutColor} strokeWidth="1.1" />
        <text x="560" y="292" fill={calloutColor} fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
          LUBE {formatLube(switches.lube)}
        </text>

        <line x1="418" y1="300" x2="552" y2="326" stroke={calloutColor} strokeWidth="1.1" />
        <text x="560" y="330" fill={calloutColor} fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
          FILM {formatFilm(switches.film)} {metrics.filmThicknessMm > 0 ? `${metrics.filmThicknessMm.toFixed(2)}mm` : ''}
        </text>

        {switches.orings.enabled && (
          <>
            <line x1="346" y1={stemRestTopY + 10} x2="452" y2={stemRestTopY - 2} stroke="#9df7c5" strokeWidth="1.2" />
            <text x="460" y={stemRestTopY + 2} fill="#9df7c5" fontSize="11" fontFamily="'SF Mono','Monaco',monospace">
              O-RING {switches.orings.thickness.toUpperCase()} {metrics.oringMm.toFixed(2)}mm
            </text>
          </>
        )}
      </svg>

      <p className={styles.desc}>
        右侧剖面图会实时跟随参数变化：弹簧圈数与压缩行程、上下壳材料、Stem 位置、静音圈/轴间纸厚度、预行程与总行程均可直接校验。
      </p>

      <div className={styles.specGrid}>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>轴体类型</span>
          <span className={styles.specValue}>{formatSwitchType(switches.type)}</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>弹簧参数</span>
          <span className={styles.specValue}>
            {switches.springWeight}g / {formatSpringType(switches.springType)}
          </span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>弹簧几何</span>
          <span className={styles.specValue}>
            {metrics.springCoils} 圈 / {metrics.springWireDiaMm.toFixed(2)}mm 线径 / {metrics.springOuterDiaMm.toFixed(1)}mm 外径
          </span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>弹簧长度</span>
          <span className={styles.specValue}>
            Lf {metrics.springFreeLengthMm.toFixed(1)}mm / Lc {metrics.springCompressedMm.toFixed(1)}mm
          </span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>润滑状态</span>
          <span className={styles.specValue}>{formatLube(switches.lube)}</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>轴间纸</span>
          <span className={styles.specValue}>
            {formatFilm(switches.film)} {metrics.filmThicknessMm > 0 ? `(${metrics.filmThicknessMm.toFixed(2)}mm)` : ''}
          </span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>材质缝合</span>
          <span className={styles.specValue}>
            TOP {topMaterialLabel} / STEM {stemMaterialLabel} / BOT {bottomMaterialLabel}
          </span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>卫星轴状态</span>
          <span className={styles.specValue}>{formatStabilizer(switches.stabilizerQuality)}</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>静音圈</span>
          <span className={styles.specValue}>
            {switches.orings.enabled ? `${switches.orings.thickness.toUpperCase()} (${metrics.oringMm.toFixed(2)}mm)` : '无'}
          </span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>关键行程</span>
          <span className={styles.specValue}>
            PRE {metrics.preTravelMm.toFixed(2)}mm / TOTAL {metrics.totalTravelMm.toFixed(2)}mm
          </span>
        </div>
      </div>
    </div>
  )
}

export default SwitchCrossSection
