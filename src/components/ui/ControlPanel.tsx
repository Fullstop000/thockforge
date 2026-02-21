'use client'

import { useMemo, useState } from 'react'
import { useKeyboardStore } from '@/store/useKeyboardStore'
import { runRenderValidation } from '@/engine/renderValidation'
import {
  CaseFinish,
  CaseMaterial,
  DeskmatType,
  KeycapLegendLang,
  KeycapLegendManufacturing,
  KeycapLegendPosition,
  KeycapMaterial,
  KeycapProfile,
  KeycapZone,
  LayoutStandard,
  LayoutType,
  LayoutVariant,
  LubeState,
  MountType,
  PlateMaterial,
  StemMaterial,
  SwitchType,
  WeightFinish,
  WeightMaterial,
  HousingMaterial,
} from '@/types/keyboard'

interface SelectOption<T> {
  value: T
  label: string
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
}) {
  return (
    <div className="control-row">
      <label className="control-label">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className="control-select">
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (value: number) => void
}) {
  return (
    <div className="control-row">
      <label className="control-label">{label}</label>
      <div className="slider-container">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="slider"
        />
        <span className="slider-value">
          {value}
          {unit}
        </span>
      </div>
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="control-row">
      <label className="control-label">{label}</label>
      <label className="toggle">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="toggle-slider" />
      </label>
    </div>
  )
}

function Section({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string
  icon: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="section">
      <button className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <span>
          {icon} {title}
        </span>
        <span className="section-arrow">{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && <div className="section-content">{children}</div>}
    </div>
  )
}

const FORM_FACTOR_OPTIONS: SelectOption<LayoutType>[] = [
  { value: '40', label: '40%' },
  { value: '60', label: '60%' },
  { value: '65', label: '65%' },
  { value: '75', label: '75%' },
  { value: '80', label: 'TKL (80%)' },
  { value: '980', label: '1800 (980)' },
  { value: '100', label: 'Full Size (100%)' },
  { value: 'alice', label: 'Alice' },
]

const LAYOUT_STANDARD_OPTIONS: SelectOption<LayoutStandard>[] = [
  { value: 'ansi', label: 'ANSI' },
  { value: 'iso', label: 'ISO' },
  { value: 'jis', label: 'JIS' },
]

const LAYOUT_VARIANT_OPTIONS: SelectOption<LayoutVariant>[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'hhkb', label: 'HHKB' },
  { value: 'thinkpad_style', label: 'ThinkPad Style' },
]

const CASE_MATERIAL_OPTIONS: SelectOption<CaseMaterial>[] = [
  { value: 'alu_6063', label: 'Aluminum 6063' },
  { value: 'alu_7075', label: 'Aluminum 7075' },
  { value: 'pc', label: 'Polycarbonate' },
  { value: 'acrylic', label: 'Acrylic' },
  { value: 'abs', label: 'ABS Plastic' },
  { value: 'wood', label: 'Wood' },
]

const CASE_FINISH_OPTIONS: SelectOption<CaseFinish>[] = [
  { value: 'anodized', label: 'Anodized' },
  { value: 'e-white', label: 'E-White' },
  { value: 'cerakote', label: 'Cerakote' },
  { value: 'powdercoat', label: 'Powder Coat' },
  { value: 'polished', label: 'Polished' },
  { value: 'beadblasted', label: 'Bead Blasted' },
]

const SCREW_TYPE_OPTIONS: SelectOption<'flathead' | 'hex'>[] = [
  { value: 'flathead', label: 'Flat Head' },
  { value: 'hex', label: 'Hex Socket' },
]

const SCREW_FINISH_OPTIONS: SelectOption<'gold' | 'silver' | 'titanium_blued'>[] = [
  { value: 'silver', label: 'Silver' },
  { value: 'gold', label: 'Gold' },
  { value: 'titanium_blued', label: 'Titanium Blued' },
]

const MOUNT_OPTIONS: SelectOption<MountType>[] = [
  { value: 'gasket_poron', label: 'Gasket (Poron)' },
  { value: 'gasket_silicone', label: 'Gasket (Silicone)' },
  { value: 'top', label: 'Top Mount' },
  { value: 'tray', label: 'Tray Mount' },
  { value: 'oring_burger', label: 'O-Ring Burger' },
  { value: 'plateless', label: 'Plateless' },
]

const WEIGHT_MATERIAL_OPTIONS: SelectOption<WeightMaterial>[] = [
  { value: 'brass', label: 'Brass' },
  { value: 'stainless', label: 'Stainless Steel' },
  { value: 'copper', label: 'Copper' },
  { value: 'alu', label: 'Aluminum' },
]

const WEIGHT_FINISH_OPTIONS: SelectOption<WeightFinish>[] = [
  { value: 'pvd_mirror', label: 'PVD Mirror' },
  { value: 'pvd_brushed', label: 'PVD Brushed' },
  { value: 'beadblasted', label: 'Bead Blasted' },
  { value: 'blued', label: 'Blued' },
  { value: 'cerakote', label: 'Cerakote' },
]

const PLATE_MATERIAL_OPTIONS: SelectOption<PlateMaterial>[] = [
  { value: 'alu', label: 'Aluminum' },
  { value: 'brass', label: 'Brass' },
  { value: 'pc', label: 'Polycarbonate' },
  { value: 'fr4', label: 'FR4' },
  { value: 'pom', label: 'POM' },
  { value: 'carbon', label: 'Carbon Fiber' },
  { value: 'ppe', label: 'PPE' },
]

const SWITCH_TYPE_OPTIONS: SelectOption<SwitchType>[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'tactile', label: 'Tactile' },
  { value: 'clicky', label: 'Clicky' },
  { value: 'silent', label: 'Silent' },
]

const SWITCH_HOUSING_OPTIONS: SelectOption<HousingMaterial>[] = [
  { value: 'nylon', label: 'Nylon' },
  { value: 'pc', label: 'Polycarbonate' },
  { value: 'pom', label: 'POM' },
  { value: 'upe', label: 'UPE' },
]

const SWITCH_STEM_OPTIONS: SelectOption<StemMaterial>[] = [
  { value: 'pom', label: 'POM' },
  { value: 'ly', label: 'LY' },
  { value: 'upe', label: 'UPE' },
  { value: 'pe', label: 'PE' },
]

const SPRING_TYPE_OPTIONS: SelectOption<'single' | 'extended' | 'progressive'>[] = [
  { value: 'single', label: 'Single Stage' },
  { value: 'extended', label: 'Extended' },
  { value: 'progressive', label: 'Progressive' },
]

const LUBE_OPTIONS: SelectOption<LubeState>[] = [
  { value: 'stock', label: 'Stock (Unlubed)' },
  { value: 'factory', label: 'Factory Lubed' },
  { value: 'hand_lubed_thin', label: 'Hand Lubed (Thin)' },
  { value: 'hand_lubed_thick', label: 'Hand Lubed (Thick)' },
]

const KEYCAP_ZONE_OPTIONS: SelectOption<KeycapZone>[] = [
  { value: 'alpha', label: 'Alpha 字母区' },
  { value: 'modifier', label: 'Modifier 功能键' },
  { value: 'function', label: 'Function F 区' },
  { value: 'nav', label: 'Nav 导航区' },
  { value: 'numpad', label: 'Numpad 数字区' },
  { value: 'space', label: 'Space 大键区' },
]

const KEYCAP_PROFILE_OPTIONS: SelectOption<KeycapProfile>[] = [
  { value: 'cherry', label: 'Cherry' },
  { value: 'sa', label: 'SA' },
  { value: 'oem', label: 'OEM' },
  { value: 'xda', label: 'XDA' },
  { value: 'dsa', label: 'DSA' },
  { value: 'mt3', label: 'MT3' },
  { value: 'kat', label: 'KAT' },
]

const KEYCAP_MATERIAL_OPTIONS: SelectOption<KeycapMaterial>[] = [
  { value: 'pbt', label: 'PBT' },
  { value: 'abs', label: 'ABS' },
  { value: 'pc', label: 'PC' },
  { value: 'pom', label: 'POM' },
  { value: 'pbt_double', label: 'PBT Double-shot' },
  { value: 'resin', label: 'Resin' },
  { value: 'ceramic', label: 'Ceramic' },
  { value: 'metal_alu', label: 'Aluminum Metal' },
  { value: 'metal_brass', label: 'Brass Metal' },
]

const LEGEND_MFG_OPTIONS: SelectOption<KeycapLegendManufacturing>[] = [
  { value: 'double_shot', label: 'Double-shot' },
  { value: 'dye_sub', label: 'Dye-sub' },
  { value: 'laser', label: 'Laser' },
  { value: 'blank', label: 'Blank' },
]

const LEGEND_LANG_OPTIONS: SelectOption<KeycapLegendLang>[] = [
  { value: 'latin', label: 'Latin' },
  { value: 'kana', label: 'Kana' },
  { value: 'cyrillic', label: 'Cyrillic' },
  { value: 'hangul', label: 'Hangul' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'none', label: 'None' },
]

const LEGEND_POSITION_OPTIONS: SelectOption<KeycapLegendPosition>[] = [
  { value: 'center', label: 'Center' },
  { value: 'top_left', label: 'Top Left' },
  { value: 'front_side', label: 'Front Side' },
  { value: 'side_shine', label: 'Side Shine' },
]

const DESKMAT_OPTIONS: SelectOption<DeskmatType>[] = [
  { value: 'none', label: 'None' },
  { value: 'cloth', label: 'Cloth' },
  { value: 'glass', label: 'Glass' },
  { value: 'leather', label: 'Leather' },
  { value: 'wood', label: 'Wood' },
]

interface ControlPanelProps {
  selectedKeycapZone?: KeycapZone
  onSelectedKeycapZoneChange?: (zone: KeycapZone) => void
}

export function ControlPanel({ selectedKeycapZone, onSelectedKeycapZoneChange }: ControlPanelProps = {}) {
  const store = useKeyboardStore()
  const [buildCode, setBuildCode] = useState('')
  const [internalSelectedZone, setInternalSelectedZone] = useState<KeycapZone>('alpha')
  const [overrideKeyId, setOverrideKeyId] = useState('esc')
  const selectedZone = selectedKeycapZone ?? internalSelectedZone
  const setSelectedZone = onSelectedKeycapZoneChange ?? setInternalSelectedZone

  const zoneConfig = useMemo(() => store.keycaps.zones[selectedZone], [selectedZone, store.keycaps.zones])

  const patchZone = (patch: Partial<typeof zoneConfig>) => {
    store.updateKeycaps({
      zones: {
        [selectedZone]: patch,
      },
    })
  }

  const handleExportBuild = () => {
    const code = store.exportBuild()
    setBuildCode(code)
    navigator.clipboard?.writeText(code).catch((error) => {
      console.error('Failed to copy build code:', error)
    })
  }

  const handleImportBuild = () => {
    if (buildCode) {
      store.importBuild(buildCode)
    }
  }

  /**
   * 运行轻量渲染自检，快速验证装配与动画关键约束是否越界。
   */
  const handleRunRenderValidation = () => {
    const report = runRenderValidation({
      keycaps: store.keycaps,
      switches: store.switches,
      internals: { mods: store.internals.mods },
    })

    if (report.passed) {
      store.emitSummaryEvent('渲染自检通过', `已检查 ${report.checkedKeys} 个样本键，未发现关键约束问题`, 'PASS')
      return
    }

    const firstIssue = report.issues[0]
    store.emitSummaryEvent(
      '渲染自检失败',
      `${report.issues.length} 个问题，首项：${firstIssue?.message || '未知错误'}`,
      'FAIL'
    )
  }

  const firstArtisan = store.keycaps.artisan.items[0]

  return (
    <div className="control-panel">
      <div className="panel-header">
        <h1>⌨️ ThockForge</h1>
        <p>次世代客制化键盘模拟器 · v3 Domain Model</p>
      </div>

      <Section title="配列与变体" icon="🧩" defaultOpen>
        <Select
          label="Form Factor"
          value={store.layout.formFactor}
          options={FORM_FACTOR_OPTIONS}
          onChange={(v) => store.updateLayout({ formFactor: v })}
        />
        <Select
          label="标准"
          value={store.layout.standard}
          options={LAYOUT_STANDARD_OPTIONS}
          onChange={(v) => store.updateLayout({ standard: v })}
        />
        <Select
          label="变体"
          value={store.layout.variant}
          options={LAYOUT_VARIANT_OPTIONS}
          onChange={(v) => store.updateLayout({ variant: v })}
        />
        <Toggle
          label="HHKB Blockers"
          checked={store.layout.specialStructure.hhkbBlockers}
          onChange={(v) =>
            store.updateLayout({
              specialStructure: { ...store.layout.specialStructure, hhkbBlockers: v },
            })
          }
        />
        <Toggle
          label="TrackPoint 键区约束"
          checked={store.layout.specialStructure.trackpointCluster}
          onChange={(v) =>
            store.updateLayout({
              specialStructure: { ...store.layout.specialStructure, trackpointCluster: v },
            })
          }
        />
      </Section>

      <Section title="外壳与结构" icon="🏗️">
        <Select label="材质" value={store.case.material} options={CASE_MATERIAL_OPTIONS} onChange={(v) => store.updateCase({ material: v })} />
        <Select label="工艺" value={store.case.finish} options={CASE_FINISH_OPTIONS} onChange={(v) => store.updateCase({ finish: v })} />
        <Select label="固定结构" value={store.case.mount} options={MOUNT_OPTIONS} onChange={(v) => store.updateCase({ mount: v })} />
        <Select
          label="螺丝类型"
          value={store.case.screws.type}
          options={SCREW_TYPE_OPTIONS}
          onChange={(v) => store.updateCase({ screws: { ...store.case.screws, type: v } })}
        />
        <Select
          label="螺丝工艺"
          value={store.case.screws.finish}
          options={SCREW_FINISH_OPTIONS}
          onChange={(v) => store.updateCase({ screws: { ...store.case.screws, finish: v } })}
        />

        <div className="subsection">
          <h4>底部配重</h4>
          <Toggle
            label="启用配重"
            checked={store.case.weight.enabled}
            onChange={(v) => store.updateCase({ weight: { ...store.case.weight, enabled: v } })}
          />
          {store.case.weight.enabled && (
            <>
              <Select
                label="材质"
                value={store.case.weight.material}
                options={WEIGHT_MATERIAL_OPTIONS}
                onChange={(v) => store.updateCase({ weight: { ...store.case.weight, material: v } })}
              />
              <Select
                label="工艺"
                value={store.case.weight.finish}
                options={WEIGHT_FINISH_OPTIONS}
                onChange={(v) => store.updateCase({ weight: { ...store.case.weight, finish: v } })}
              />
            </>
          )}
        </div>
      </Section>

      <Section title="内胆与填充" icon="🔧">
        <Select
          label="定位板材质"
          value={store.internals.plateMaterial}
          options={PLATE_MATERIAL_OPTIONS}
          onChange={(v) => store.updateInternals({ plateMaterial: v })}
        />
        <Toggle
          label="定位板开槽"
          checked={store.internals.plateFlexCuts}
          onChange={(v) => store.updateInternals({ plateFlexCuts: v })}
        />

        <div className="subsection">
          <h4>消音填充</h4>
          <Toggle
            label="底棉"
            checked={store.internals.foams.caseFoam}
            onChange={(v) => store.updateInternals({ foams: { ...store.internals.foams, caseFoam: v } })}
          />
          <Toggle
            label="夹心棉"
            checked={store.internals.foams.plateFoam}
            onChange={(v) => store.updateInternals({ foams: { ...store.internals.foams, plateFoam: v } })}
          />
          <Toggle
            label="PE轴下垫"
            checked={store.internals.foams.peSheet}
            onChange={(v) => store.updateInternals({ foams: { ...store.internals.foams, peSheet: v } })}
          />
          <Toggle
            label="IXPE轴下垫"
            checked={store.internals.foams.ixpe}
            onChange={(v) => store.updateInternals({ foams: { ...store.internals.foams, ixpe: v } })}
          />
          <Toggle
            label="空格键消音棉"
            checked={store.internals.foams.spacebarFoam}
            onChange={(v) => store.updateInternals({ foams: { ...store.internals.foams, spacebarFoam: v } })}
          />
        </div>

        <div className="subsection">
          <h4>极客改模</h4>
          <Slider
            label="Tape Mod"
            value={store.internals.mods.tapeMod}
            min={0}
            max={3}
            step={1}
            unit="层"
            onChange={(v) => store.updateInternals({ mods: { ...store.internals.mods, tapeMod: v } })}
          />
          <Toggle
            label="Holee Mod"
            checked={store.internals.mods.holeeMod}
            onChange={(v) => store.updateInternals({ mods: { ...store.internals.mods, holeeMod: v } })}
          />
          <Toggle
            label="PE Foam Mod"
            checked={store.internals.mods.peFoamMod}
            onChange={(v) => store.updateInternals({ mods: { ...store.internals.mods, peFoamMod: v } })}
          />
        </div>
      </Section>

      <Section title="轴体与调教" icon="⚡">
        <Select label="轴体类型" value={store.switches.type} options={SWITCH_TYPE_OPTIONS} onChange={(v) => store.updateSwitches({ type: v })} />
        <Select
          label="弹簧类型"
          value={store.switches.springType}
          options={SPRING_TYPE_OPTIONS}
          onChange={(v) => store.updateSwitches({ springType: v })}
        />
        <Slider
          label="弹簧克数"
          value={store.switches.springWeight}
          min={35}
          max={80}
          step={5}
          unit="g"
          onChange={(v) => store.updateSwitches({ springWeight: v })}
        />
        <Select label="润滑状态" value={store.switches.lube} options={LUBE_OPTIONS} onChange={(v) => store.updateSwitches({ lube: v })} />
        <Toggle
          label="轴间纸"
          checked={store.switches.film !== 'none'}
          onChange={(v) => store.updateSwitches({ film: v ? 'pc' : 'none' })}
        />

        <div className="subsection">
          <h4>静音圈 (O-Rings)</h4>
          <Toggle
            label="启用 O-Ring"
            checked={store.switches.orings.enabled}
            onChange={(v) => store.updateSwitches({ orings: { ...store.switches.orings, enabled: v } })}
          />
          {store.switches.orings.enabled && (
            <Select
              label="厚度"
              value={store.switches.orings.thickness}
              options={[
                { value: 'thin', label: 'Thin' },
                { value: 'thick', label: 'Thick' },
              ]}
              onChange={(v) => store.updateSwitches({ orings: { ...store.switches.orings, thickness: v } })}
            />
          )}
        </div>

        <div className="subsection">
          <h4>轴体材质缝合</h4>
          <Select
            label="上盖"
            value={store.switches.materials.top}
            options={SWITCH_HOUSING_OPTIONS}
            onChange={(v) => store.updateSwitches({ materials: { ...store.switches.materials, top: v } })}
          />
          <Select
            label="轴心"
            value={store.switches.materials.stem}
            options={SWITCH_STEM_OPTIONS}
            onChange={(v) => store.updateSwitches({ materials: { ...store.switches.materials, stem: v } })}
          />
          <Select
            label="底壳"
            value={store.switches.materials.bottom}
            options={SWITCH_HOUSING_OPTIONS}
            onChange={(v) => store.updateSwitches({ materials: { ...store.switches.materials, bottom: v } })}
          />
        </div>

        <div className="subsection">
          <h4>卫星轴</h4>
          <Select
            label="状态"
            value={store.switches.stabilizerQuality}
            options={[
              { value: 'perfect', label: '完美调教' },
              { value: 'minor_rattle', label: '轻微杂音' },
              { value: 'rattle', label: '明显杂音' },
            ]}
            onChange={(v) => store.updateSwitches({ stabilizerQuality: v })}
          />
        </div>
      </Section>

      <Section title="键帽（分区 + 覆盖）" icon="🎨">
        <Select label="编辑分区" value={selectedZone} options={KEYCAP_ZONE_OPTIONS} onChange={setSelectedZone} />
        <Select label="Profile" value={zoneConfig.profile} options={KEYCAP_PROFILE_OPTIONS} onChange={(v) => patchZone({ profile: v })} />
        <Select label="材质" value={zoneConfig.material} options={KEYCAP_MATERIAL_OPTIONS} onChange={(v) => patchZone({ material: v })} />
        <Select
          label="行列雕刻"
          value={zoneConfig.rowSculpt}
          options={[
            { value: 'sculpted', label: 'Sculpted' },
            { value: 'uniform', label: 'Uniform' },
          ]}
          onChange={(v) => patchZone({ rowSculpt: v })}
        />
        <Slider
          label="顶面厚度"
          value={zoneConfig.thickness.topMm}
          min={1}
          max={2.2}
          step={0.05}
          unit="mm"
          onChange={(v) => patchZone({ thickness: { ...zoneConfig.thickness, topMm: v } })}
        />
        <Slider
          label="侧壁厚度"
          value={zoneConfig.thickness.sideMm}
          min={0.8}
          max={2}
          step={0.05}
          unit="mm"
          onChange={(v) => patchZone({ thickness: { ...zoneConfig.thickness, sideMm: v } })}
        />

        <Select
          label="字符工艺"
          value={zoneConfig.legendManufacturing}
          options={LEGEND_MFG_OPTIONS}
          onChange={(v) => patchZone({ legendManufacturing: v })}
        />
        <Select label="主字符" value={zoneConfig.legendPrimary} options={LEGEND_LANG_OPTIONS} onChange={(v) => patchZone({ legendPrimary: v })} />
        <Select label="副字符" value={zoneConfig.legendSub} options={LEGEND_LANG_OPTIONS} onChange={(v) => patchZone({ legendSub: v })} />
        <Select
          label="印字位置"
          value={zoneConfig.legendPosition}
          options={LEGEND_POSITION_OPTIONS}
          onChange={(v) => patchZone({ legendPosition: v })}
        />
        <Slider
          label="字符透明度"
          value={zoneConfig.legendOpacity}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => patchZone({ legendOpacity: v })}
        />

        <Select
          label="主题"
          value={zoneConfig.theme}
          options={[
            { value: 'default', label: 'Default White' },
            { value: 'carbon', label: 'Carbon' },
            { value: 'pastel', label: 'Pastel' },
            { value: 'cyberpunk', label: 'Cyberpunk' },
            { value: 'ocean', label: 'Ocean Blue' },
          ]}
          onChange={(v) => patchZone({ theme: v })}
        />
        <div className="control-row">
          <label className="control-label">Colorway</label>
          <input
            type="text"
            value={zoneConfig.colorway}
            onChange={(e) => patchZone({ colorway: e.target.value || 'classic' })}
            className="control-input"
            placeholder="classic/mod/fn/..."
          />
        </div>
        <Slider
          label="旧化与打油"
          value={zoneConfig.wearShineLevel}
          min={0}
          max={100}
          step={1}
          unit="%"
          onChange={(v) => patchZone({ wearShineLevel: v })}
        />
        <Select
          label="旧化分布"
          value={zoneConfig.wearPattern}
          options={[
            { value: 'uniform', label: 'Uniform' },
            { value: 'wasd_focus', label: 'WASD Focus' },
            { value: 'space_focus', label: 'Space Focus' },
          ]}
          onChange={(v) => patchZone({ wearPattern: v })}
        />
        <Slider
          label="空腔系数"
          value={zoneConfig.hollowFactor}
          min={0.5}
          max={1.5}
          step={0.05}
          onChange={(v) => patchZone({ hollowFactor: v })}
        />

        <div className="subsection">
          <h4>单键覆盖</h4>
          <div className="control-row">
            <label className="control-label">Key ID</label>
            <input
              type="text"
              value={overrideKeyId}
              onChange={(e) => setOverrideKeyId(e.target.value)}
              className="control-input"
              placeholder="esc / space / enter"
            />
          </div>
          <div className="control-row" style={{ gap: 8 }}>
            <button
              className="btn btn-small"
              onClick={() => {
                if (!overrideKeyId.trim()) {
                  return
                }
                store.updateKeycaps({
                  overrides: {
                    ...store.keycaps.overrides,
                    [overrideKeyId.trim()]: {
                      ...zoneConfig,
                    },
                  },
                })
              }}
            >
              复制当前分区到单键
            </button>
            <button
              className="btn btn-small"
              onClick={() => {
                if (!overrideKeyId.trim()) {
                  return
                }
                const next = { ...store.keycaps.overrides }
                delete next[overrideKeyId.trim()]
                store.updateKeycaps({ overrides: next })
              }}
            >
              删除单键覆盖
            </button>
          </div>
        </div>

        <div className="subsection">
          <h4>Artisan</h4>
          <Toggle
            label="启用 Artisan"
            checked={store.keycaps.artisan.enabled}
            onChange={(v) => store.updateKeycaps({ artisan: { ...store.keycaps.artisan, enabled: v } })}
          />
          {store.keycaps.artisan.enabled && (
            <>
              <div className="control-row">
                <label className="control-label">Key ID</label>
                <input
                  type="text"
                  value={firstArtisan?.keyId || 'esc'}
                  onChange={(e) =>
                    store.updateKeycaps({
                      artisan: {
                        ...store.keycaps.artisan,
                        items: [
                          {
                            keyId: e.target.value || 'esc',
                            url: firstArtisan?.url || '',
                            materialHint: firstArtisan?.materialHint,
                          },
                        ],
                      },
                    })
                  }
                  className="control-input"
                />
              </div>
              <div className="control-row">
                <label className="control-label">资源 URL</label>
                <input
                  type="text"
                  value={firstArtisan?.url || ''}
                  onChange={(e) =>
                    store.updateKeycaps({
                      artisan: {
                        ...store.keycaps.artisan,
                        items: [
                          {
                            keyId: firstArtisan?.keyId || 'esc',
                            url: e.target.value,
                            materialHint: firstArtisan?.materialHint || 'resin',
                          },
                        ],
                      },
                    })
                  }
                  className="control-input"
                  placeholder="https://..."
                />
              </div>
            </>
          )}
        </div>
      </Section>

      <Section title="模块域 (Modules)" icon="🧠">
        <div className="subsection">
          <h4>OLED</h4>
          <Toggle
            label="启用 OLED"
            checked={store.modules.oled.enabled}
            onChange={(v) => store.updateModules({ oled: { ...store.modules.oled, enabled: v } })}
          />
          {store.modules.oled.enabled && (
            <>
              <Select
                label="显示内容"
                value={store.modules.oled.display}
                options={[
                  { value: 'wpm', label: 'WPM' },
                  { value: 'time', label: 'Time' },
                  { value: 'gif', label: 'GIF' },
                  { value: 'custom', label: 'Custom' },
                ]}
                onChange={(v) => store.updateModules({ oled: { ...store.modules.oled, display: v } })}
              />
              <Select
                label="安装位置"
                value={store.modules.oled.position}
                options={[
                  { value: 'top_right', label: 'Top Right' },
                  { value: 'top_left', label: 'Top Left' },
                  { value: 'center', label: 'Center' },
                ]}
                onChange={(v) => store.updateModules({ oled: { ...store.modules.oled, position: v } })}
              />
            </>
          )}
        </div>

        <div className="subsection">
          <h4>旋钮</h4>
          <Toggle
            label="启用旋钮"
            checked={store.modules.knob.enabled}
            onChange={(v) => store.updateModules({ knob: { ...store.modules.knob, enabled: v } })}
          />
          {store.modules.knob.enabled && (
            <>
              <Slider
                label="数量"
                value={store.modules.knob.count}
                min={1}
                max={4}
                step={1}
                onChange={(v) => store.updateModules({ knob: { ...store.modules.knob, count: v } })}
              />
              <Select
                label="位置"
                value={store.modules.knob.position}
                options={[
                  { value: 'top_right', label: 'Top Right' },
                  { value: 'right_edge', label: 'Right Edge' },
                  { value: 'left_edge', label: 'Left Edge' },
                ]}
                onChange={(v) => store.updateModules({ knob: { ...store.modules.knob, position: v } })}
              />
              <Select
                label="阻尼"
                value={store.modules.knob.detent}
                options={[
                  { value: 'soft', label: 'Soft' },
                  { value: 'hard', label: 'Hard' },
                ]}
                onChange={(v) => store.updateModules({ knob: { ...store.modules.knob, detent: v } })}
              />
            </>
          )}
        </div>

        <div className="subsection">
          <h4>TrackPoint</h4>
          <Toggle
            label="启用 TrackPoint"
            checked={store.modules.trackpoint.enabled}
            onChange={(v) => store.updateModules({ trackpoint: { ...store.modules.trackpoint, enabled: v } })}
          />
          {store.modules.trackpoint.enabled && (
            <>
              <div className="control-row">
                <label className="control-label">颜色</label>
                <input
                  type="color"
                  value={store.modules.trackpoint.color}
                  onChange={(e) => store.updateModules({ trackpoint: { ...store.modules.trackpoint, color: e.target.value } })}
                  className="color-picker"
                />
              </div>
              <Select
                label="帽型"
                value={store.modules.trackpoint.capType}
                options={[
                  { value: 'classic', label: 'Classic' },
                  { value: 'soft_rim', label: 'Soft Rim' },
                  { value: 'low_profile', label: 'Low Profile' },
                ]}
                onChange={(v) => store.updateModules({ trackpoint: { ...store.modules.trackpoint, capType: v } })}
              />
              <Slider
                label="灵敏度"
                value={store.modules.trackpoint.sensitivity}
                min={0.1}
                max={2}
                step={0.1}
                onChange={(v) => store.updateModules({ trackpoint: { ...store.modules.trackpoint, sensitivity: v } })}
              />
              <Select
                label="安装区"
                value={store.modules.trackpoint.zone}
                options={[
                  { value: 'g_h_b', label: 'G/H/B' },
                  { value: 'center_cluster', label: 'Center Cluster' },
                ]}
                onChange={(v) => store.updateModules({ trackpoint: { ...store.modules.trackpoint, zone: v } })}
              />
            </>
          )}
        </div>

        <div className="subsection">
          <h4>板载灯效</h4>
          <Toggle
            label="启用灯效"
            checked={store.modules.lighting.enabled}
            onChange={(v) => store.updateModules({ lighting: { ...store.modules.lighting, enabled: v } })}
          />
          {store.modules.lighting.enabled && (
            <>
              <Select
                label="模式"
                value={store.modules.lighting.mode}
                options={[
                  { value: 'static', label: '静态' },
                  { value: 'wave', label: '波浪' },
                  { value: 'reactive', label: '触发' },
                  { value: 'rainbow', label: '彩虹' },
                ]}
                onChange={(v) => store.updateModules({ lighting: { ...store.modules.lighting, mode: v } })}
              />
              <div className="control-row">
                <label className="control-label">颜色</label>
                <input
                  type="color"
                  value={store.modules.lighting.color}
                  onChange={(e) => store.updateModules({ lighting: { ...store.modules.lighting, color: e.target.value } })}
                  className="color-picker"
                />
              </div>
              <Slider
                label="Reactive 扩散"
                value={store.modules.lighting.reactiveSpread}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => store.updateModules({ lighting: { ...store.modules.lighting, reactiveSpread: v } })}
              />
            </>
          )}
        </div>
      </Section>

      <Section title="桌面生态 (Desk Setup)" icon="🖥️">
        <Select
          label="桌垫"
          value={store.deskSetup.deskmat}
          options={DESKMAT_OPTIONS}
          onChange={(v) => store.updateDeskSetup({ deskmat: v })}
        />
        <div className="control-row">
          <label className="control-label">桌垫颜色</label>
          <input
            type="color"
            value={store.deskSetup.deskmatColor}
            onChange={(e) => store.updateDeskSetup({ deskmatColor: e.target.value })}
            className="color-picker"
          />
        </div>
        <Select
          label="桌面材质"
          value={store.deskSetup.deskSurface}
          options={[
            { value: 'wood', label: 'Wood' },
            { value: 'glass', label: 'Glass' },
            { value: 'stone', label: 'Stone' },
            { value: 'laminate', label: 'Laminate' },
          ]}
          onChange={(v) => store.updateDeskSetup({ deskSurface: v })}
        />

        <div className="subsection">
          <h4>连接线材</h4>
          <Toggle
            label="显示线材"
            checked={store.deskSetup.cable.enabled}
            onChange={(v) => store.updateDeskSetup({ cable: { ...store.deskSetup.cable, enabled: v } })}
          />
          {store.deskSetup.cable.enabled && (
            <>
              <Select
                label="类型"
                value={store.deskSetup.cable.type}
                options={[
                  { value: 'coiled_usb', label: 'Coiled USB' },
                  { value: 'aviator', label: 'Aviator' },
                  { value: 'lemo', label: 'LEMO' },
                  { value: 'straight_usb', label: 'Straight USB' },
                ]}
                onChange={(v) => store.updateDeskSetup({ cable: { ...store.deskSetup.cable, type: v } })}
              />
              <div className="control-row">
                <label className="control-label">颜色</label>
                <input
                  type="color"
                  value={store.deskSetup.cable.color}
                  onChange={(e) => store.updateDeskSetup({ cable: { ...store.deskSetup.cable, color: e.target.value } })}
                  className="color-picker"
                />
              </div>
            </>
          )}
        </div>
      </Section>

      <Section title="声学覆盖 (Acoustic Overrides)" icon="🔊">
        <Slider
          label="Brightness"
          value={store.acousticOverrides.brightness}
          min={0.5}
          max={1.5}
          step={0.05}
          onChange={(v) => store.updateAcousticOverrides({ brightness: v })}
        />
        <Slider
          label="Dampening"
          value={store.acousticOverrides.dampening}
          min={0.5}
          max={1.5}
          step={0.05}
          onChange={(v) => store.updateAcousticOverrides({ dampening: v })}
        />
        <Slider
          label="Reverb"
          value={store.acousticOverrides.reverb}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => store.updateAcousticOverrides({ reverb: v })}
        />
      </Section>

      <Section title="可视调试与验证" icon="🧪">
        <div className="control-row" style={{ gap: 8 }}>
          <button className="btn btn-small" onClick={() => store.toggleHideKeycaps()}>
            {store.renderVisibility.hideKeycaps ? '恢复所有键帽' : '移除所有键帽'}
          </button>
          <button className="btn btn-small" onClick={() => store.toggleHideSwitches()}>
            {store.renderVisibility.hideSwitches ? '恢复所有轴体' : '移除所有轴体'}
          </button>
        </div>

        <div className="control-row" style={{ gap: 8 }}>
          <button className="btn btn-small" onClick={handleRunRenderValidation}>
            运行渲染自检
          </button>
        </div>
      </Section>

      <div className="panel-footer">
        <button className="btn btn-primary" onClick={handleExportBuild}>
          📤 导出配置
        </button>
        <button className="btn btn-secondary" onClick={() => store.resetToDefaults()}>
          🔄 重置
        </button>
      </div>

      <div className="build-code">
        <input
          type="text"
          value={buildCode}
          onChange={(e) => setBuildCode(e.target.value)}
          placeholder="粘贴 Build Code..."
        />
        <button className="btn btn-small" onClick={handleImportBuild}>
          导入
        </button>
      </div>
    </div>
  )
}

export default ControlPanel
