/**
 * 键盘持久化配置类型定义。
 * 该文件只存放“可序列化”的配置数据，不放运行态字段与副作用逻辑。
 */

export type LayoutType = '40' | '60' | '65' | '75' | '80' | '980' | '100' | 'alice'

export type LayoutStandard = 'ansi' | 'iso' | 'jis'
export type LayoutVariant = 'standard' | 'hhkb' | 'thinkpad_style'

export type CaseMaterial = 'alu_6063' | 'alu_7075' | 'pc' | 'acrylic' | 'abs' | 'wood'
export type CaseFinish = 'anodized' | 'e-white' | 'cerakote' | 'powdercoat' | 'polished' | 'beadblasted'
export type MountType = 'gasket_poron' | 'gasket_silicone' | 'top' | 'tray' | 'oring_burger' | 'plateless'

export type WeightMaterial = 'brass' | 'stainless' | 'copper' | 'alu'
export type WeightFinish = 'pvd_mirror' | 'pvd_brushed' | 'beadblasted' | 'blued' | 'cerakote'

export type PlateMaterial = 'alu' | 'brass' | 'pc' | 'fr4' | 'pom' | 'carbon' | 'ppe'
export type SwitchType = 'linear' | 'tactile' | 'clicky' | 'silent'
export type StemMaterial = 'pom' | 'ly' | 'upe' | 'pe'
export type HousingMaterial = 'nylon' | 'pc' | 'pom' | 'upe'
export type LubeState = 'stock' | 'factory' | 'hand_lubed_thin' | 'hand_lubed_thick'
export type FilmType = 'none' | 'pc' | 'pom' | 'pet'

export type KeycapProfile = 'cherry' | 'sa' | 'oem' | 'xda' | 'dsa' | 'mt3' | 'kat'
export type KeycapMaterial = 'pbt' | 'abs' | 'pc' | 'pom' | 'pbt_double' | 'resin' | 'ceramic' | 'metal_alu' | 'metal_brass'
export type KeycapZone = 'alpha' | 'modifier' | 'function' | 'nav' | 'numpad' | 'space'
export type KeycapLegendManufacturing = 'double_shot' | 'dye_sub' | 'laser' | 'blank'
export type KeycapBodyManufacturing = 'injection' | 'cnc'
export type KeycapLegendLang = 'latin' | 'kana' | 'cyrillic' | 'hangul' | 'fantasy' | 'none'
export type KeycapLegendPosition = 'center' | 'top_left' | 'front_side' | 'side_shine'

export type DeskmatType = 'none' | 'cloth' | 'glass' | 'leather' | 'wood'
export type CableType = 'aviator' | 'lemo' | 'coiled_usb' | 'straight_usb'

/**
 * 配列域配置：负责键位标准与特殊构造约束。
 */
export interface LayoutConfig {
  /** 主配列（40/60/75/Alice 等）。 */
  formFactor: LayoutType
  /** 物理标准（ANSI/ISO/JIS）。 */
  standard: LayoutStandard
  /** 结构变体（标准/HHKB/ThinkPad 风格）。 */
  variant: LayoutVariant
  /** 特殊构造开关。 */
  specialStructure: {
    /** HHKB 风格 blocker 可视件。 */
    hhkbBlockers: boolean
    /** ThinkPad 风格 TrackPoint 键区约束。 */
    trackpointCluster: boolean
  }
}

/**
 * 外壳层配置：决定机身造型、材质工艺与可见结构件。
 */
export interface CaseConfig {
  /** 外壳主材质，影响机身反射质感与基础声学特征。 */
  material: CaseMaterial
  /** 外壳表面工艺，影响清漆、粗糙度、反光表现。 */
  finish: CaseFinish
  /** 固定结构类型（Gasket/Top/Tray 等），影响结构示意件与手感预期。 */
  mount: MountType
  /** 底部配重配置。 */
  weight: {
    /** 是否显示并启用底部配重可视件。 */
    enabled: boolean
    /** 配重材质（金属种类）。 */
    material: WeightMaterial
    /** 配重工艺（镜面/拉丝/发黑等）。 */
    finish: WeightFinish
  }
  /** 外壳螺丝配置。 */
  screws: {
    /** 螺丝头型（沉头/内六角）。 */
    type: 'flathead' | 'hex'
    /** 螺丝表面处理（银色/金色/钛蓝）。 */
    finish: 'gold' | 'silver' | 'titanium_blued'
  }
}

/**
 * 内胆层配置：用于声学演算与剖切预览。
 */
export interface InternalsConfig {
  /** 定位板材质。 */
  plateMaterial: PlateMaterial
  /** 是否启用定位板开槽（Flex Cut）效果。 */
  plateFlexCuts: boolean
  /** 各类消音/调音填充层。 */
  foams: {
    /** 底棉。 */
    caseFoam: boolean
    /** 夹心棉（Plate Foam）。 */
    plateFoam: boolean
    /** PE 轴下垫。 */
    peSheet: boolean
    /** IXPE 轴下垫。 */
    ixpe: boolean
    /** 空格键消音棉。 */
    spacebarFoam: boolean
  }
  /** 玩家常见极客改模项。 */
  mods: {
    /** Tape Mod 层数，范围 0~3。 */
    tapeMod: number
    /** Holee Mod 开关。 */
    holeeMod: boolean
    /** 额外 PE Foam Mod 开关。 */
    peFoamMod: boolean
  }
}

/**
 * 轴体层配置（当前版本为全局统一，不做单键级轴体差异）。
 */
export interface SwitchConfig {
  /** 轴体类型（线性/段落/点击/静音）。 */
  type: SwitchType
  /** 轴体上盖/轴心/底壳材质缝合配置。 */
  materials: {
    /** 上盖材质。 */
    top: HousingMaterial
    /** 轴心材质。 */
    stem: StemMaterial
    /** 底壳材质。 */
    bottom: HousingMaterial
  }
  /** 弹簧压力克数（g）。 */
  springWeight: number
  /** 弹簧类型（单段/加长/渐进）。 */
  springType: 'single' | 'extended' | 'progressive'
  /** 润滑状态。 */
  lube: LubeState
  /** 轴间纸类型。 */
  film: FilmType
  /** 大键卫星轴调教质量。 */
  stabilizerQuality: 'perfect' | 'minor_rattle' | 'rattle'
  /** 键帽静音圈配置。 */
  orings: {
    /** 是否启用 O-Ring。 */
    enabled: boolean
    /** O-Ring 厚度。 */
    thickness: 'thin' | 'thick'
  }
}

/**
 * 键帽分区配置：定义一个分区内键帽的几何/材质/字符/视觉特征。
 */
export interface KeycapZoneConfig {
  /** 键帽高度轮廓（Profile）。 */
  profile: KeycapProfile
  /** 行列雕刻模式（统一或阶梯雕刻）。 */
  rowSculpt: 'uniform' | 'sculpted'
  /** 键帽厚度（毫米）。 */
  thickness: {
    /** 顶部厚度（mm）。 */
    topMm: number
    /** 侧壁厚度（mm）。 */
    sideMm: number
  }
  /** 键帽基础材质。 */
  material: KeycapMaterial
  /** 键帽本体制造方式。 */
  bodyManufacturing: KeycapBodyManufacturing
  /** 字符制造工艺。 */
  legendManufacturing: KeycapLegendManufacturing
  /** 主字符语言包。 */
  legendPrimary: KeycapLegendLang
  /** 副字符语言包。 */
  legendSub: KeycapLegendLang
  /** 字符位置。 */
  legendPosition: KeycapLegendPosition
  /** 字符透明度（0~1）。 */
  legendOpacity: number
  /** 主题标识（可映射预设纹理或程序化纹理）。 */
  theme: string
  /** 配色方案标识。 */
  colorway: string
  /** 打油与旧化程度（0~100）。 */
  wearShineLevel: number
  /** 旧化分布模型。 */
  wearPattern: 'uniform' | 'wasd_focus' | 'space_focus'
  /** 空腔系数（0.5~1.5，供声学派生层使用）。 */
  hollowFactor: number
}

/**
 * Artisan 键帽绑定信息。
 */
export interface ArtisanAssignment {
  /** 绑定键位 ID（例如 esc、space、enter）。 */
  keyId: string
  /** 模型或贴图资源地址。 */
  url: string
  /** 材质提示（用于渲染/声学预设选择）。 */
  materialHint?: 'resin' | 'metal' | 'stone' | 'other'
}

/**
 * 键帽层配置：采用“分区 + 单键覆盖”模型。
 */
export interface KeycapConfig {
  /** 分区配置主表。 */
  zones: Record<KeycapZone, KeycapZoneConfig>
  /** 单键覆盖配置，key 为 keyId。 */
  overrides: Record<string, Partial<KeycapZoneConfig>>
  /** Artisan 特殊键帽配置。 */
  artisan: {
    /** 是否启用 Artisan 逻辑。 */
    enabled: boolean
    /** Artisan 绑定列表。 */
    items: ArtisanAssignment[]
  }
}

/**
 * 板载模块域：存放 OLED、旋钮、TrackPoint、灯效控制等能力。
 */
export interface ModulesConfig {
  /** OLED 模块。 */
  oled: {
    /** 是否启用 OLED。 */
    enabled: boolean
    /** OLED 展示模板。 */
    display: 'wpm' | 'time' | 'gif' | 'custom'
    /** OLED 安装位置。 */
    position: 'top_right' | 'top_left' | 'center'
  }
  /** 旋钮模块。 */
  knob: {
    /** 是否启用旋钮。 */
    enabled: boolean
    /** 旋钮数量。 */
    count: number
    /** 旋钮位置。 */
    position: 'top_right' | 'right_edge' | 'left_edge'
    /** 旋钮段落阻尼感。 */
    detent: 'soft' | 'hard'
  }
  /** TrackPoint 模块。 */
  trackpoint: {
    /** 是否启用 TrackPoint。 */
    enabled: boolean
    /** TrackPoint 颜色。 */
    color: string
    /** 帽型。 */
    capType: 'classic' | 'soft_rim' | 'low_profile'
    /** 灵敏度（0.1~2.0）。 */
    sensitivity: number
    /** 安装键区。 */
    zone: 'g_h_b' | 'center_cluster'
  }
  /** 板载灯效控制。 */
  lighting: {
    /** 是否启用灯效。 */
    enabled: boolean
    /** 灯效模式。 */
    mode: 'static' | 'wave' | 'reactive' | 'rainbow'
    /** 灯效主色。 */
    color: string
    /** Reactive 扩散半径（0~1）。 */
    reactiveSpread: number
  }
}

/**
 * 桌面生态域：描述桌垫、桌面材质和连接线等外部环境。
 */
export interface DeskSetupConfig {
  /** 桌垫类型。 */
  deskmat: DeskmatType
  /** 桌垫颜色。 */
  deskmatColor: string
  /** 桌面反射材质。 */
  deskSurface: 'wood' | 'glass' | 'stone' | 'laminate'
  /** 线材配置。 */
  cable: {
    /** 是否显示线材。 */
    enabled: boolean
    /** 线材类型。 */
    type: CableType
    /** 线材颜色。 */
    color: string
  }
}

/**
 * 声学微调覆盖项：在物理派生结果之上做少量后期调味。
 */
export interface AcousticOverrides {
  /** 整体亮度增益（0.5~1.5）。 */
  brightness: number
  /** 整体阻尼增益（0.5~1.5）。 */
  dampening: number
  /** 混响增益（0~1）。 */
  reverb: number
}

/**
 * @deprecated 仅用于 v2 Build Code 迁移。
 * 新代码请改用 `modules + deskSetup`。
 */
export interface EnvironmentConfig {
  deskmat: DeskmatType
  deskmatColor: string
  rgbEnabled: boolean
  rgbMode: 'static' | 'wave' | 'reactive' | 'rainbow'
  rgbColor: string
  cable: {
    enabled: boolean
    type: CableType
    color: string
  }
  oled: {
    enabled: boolean
    display: 'wpm' | 'time' | 'gif' | 'custom'
  }
}

/**
 * 全量持久化配置对象（Build Code 导入/导出的核心载荷）。
 */
export interface KeyboardConfig {
  /** 配列域配置。 */
  layout: LayoutConfig
  /** 外壳域配置。 */
  case: CaseConfig
  /** 内胆域配置。 */
  internals: InternalsConfig
  /** 轴体域配置。 */
  switches: SwitchConfig
  /** 键帽域配置。 */
  keycaps: KeycapConfig
  /** 模块域配置。 */
  modules: ModulesConfig
  /** 桌面生态域配置。 */
  deskSetup: DeskSetupConfig
  /** 声学覆盖参数。 */
  acousticOverrides: AcousticOverrides
}

/**
 * 默认配列域配置。
 */
export const DEFAULT_LAYOUT: LayoutConfig = {
  formFactor: '75',
  standard: 'ansi',
  variant: 'standard',
  specialStructure: {
    hhkbBlockers: false,
    trackpointCluster: false,
  },
}

/**
 * 默认外壳配置：用于冷启动与非法导入时回退。
 */
export const DEFAULT_CASE: CaseConfig = {
  material: 'alu_6063',
  finish: 'anodized',
  mount: 'gasket_poron',
  weight: {
    enabled: true,
    material: 'brass',
    finish: 'pvd_mirror',
  },
  screws: {
    type: 'hex',
    finish: 'silver',
  },
}

/**
 * 默认内胆配置：偏均衡的基础手感/声学预设。
 */
export const DEFAULT_INTERNALS: InternalsConfig = {
  plateMaterial: 'fr4',
  plateFlexCuts: false,
  foams: {
    caseFoam: true,
    plateFoam: true,
    peSheet: true,
    ixpe: false,
    spacebarFoam: false,
  },
  mods: {
    tapeMod: 0,
    holeeMod: false,
    peFoamMod: false,
  },
}

/**
 * 默认轴体配置：中性、通用的演示参数。
 */
export const DEFAULT_SWITCHES: SwitchConfig = {
  type: 'linear',
  materials: {
    top: 'nylon',
    stem: 'pom',
    bottom: 'nylon',
  },
  springWeight: 62,
  springType: 'single',
  lube: 'factory',
  film: 'none',
  stabilizerQuality: 'perfect',
  orings: {
    enabled: false,
    thickness: 'thin',
  },
}

const DEFAULT_KEYCAP_ZONE: KeycapZoneConfig = {
  profile: 'cherry',
  rowSculpt: 'sculpted',
  thickness: {
    topMm: 1.5,
    sideMm: 1.3,
  },
  material: 'pbt',
  bodyManufacturing: 'injection',
  legendManufacturing: 'double_shot',
  legendPrimary: 'latin',
  legendSub: 'none',
  legendPosition: 'center',
  legendOpacity: 1,
  theme: 'default',
  colorway: 'classic',
  wearShineLevel: 8,
  wearPattern: 'uniform',
  hollowFactor: 1,
}

/**
 * 默认键帽配置：分区默认 + 空覆盖。
 */
export const DEFAULT_KEYCAPS: KeycapConfig = {
  zones: {
    alpha: { ...DEFAULT_KEYCAP_ZONE },
    modifier: { ...DEFAULT_KEYCAP_ZONE, theme: 'carbon', colorway: 'mod' },
    function: { ...DEFAULT_KEYCAP_ZONE, theme: 'ocean', colorway: 'fn' },
    nav: { ...DEFAULT_KEYCAP_ZONE, theme: 'pastel', colorway: 'nav' },
    numpad: { ...DEFAULT_KEYCAP_ZONE, theme: 'default', colorway: 'numpad' },
    space: { ...DEFAULT_KEYCAP_ZONE, thickness: { topMm: 1.6, sideMm: 1.4 }, wearPattern: 'space_focus' },
  },
  overrides: {},
  artisan: {
    enabled: false,
    items: [],
  },
}

/**
 * 默认模块域配置。
 */
export const DEFAULT_MODULES: ModulesConfig = {
  oled: {
    enabled: false,
    display: 'wpm',
    position: 'top_right',
  },
  knob: {
    enabled: false,
    count: 1,
    position: 'top_right',
    detent: 'soft',
  },
  trackpoint: {
    enabled: false,
    color: '#d42935',
    capType: 'classic',
    sensitivity: 1,
    zone: 'g_h_b',
  },
  lighting: {
    enabled: true,
    mode: 'reactive',
    color: '#00ff88',
    reactiveSpread: 0.7,
  },
}

/**
 * 默认桌面生态域配置。
 */
export const DEFAULT_DESK_SETUP: DeskSetupConfig = {
  deskmat: 'cloth',
  deskmatColor: '#1a1a1a',
  deskSurface: 'wood',
  cable: {
    enabled: true,
    type: 'coiled_usb',
    color: '#000000',
  },
}

/**
 * 默认声学覆盖参数。
 */
export const DEFAULT_ACOUSTIC_OVERRIDES: AcousticOverrides = {
  brightness: 1,
  dampening: 1,
  reverb: 0.2,
}

/**
 * @deprecated 仅用于历史代码回退和 v2 导入兜底。
 */
export const DEFAULT_ENVIRONMENT: EnvironmentConfig = {
  deskmat: DEFAULT_DESK_SETUP.deskmat,
  deskmatColor: DEFAULT_DESK_SETUP.deskmatColor,
  rgbEnabled: DEFAULT_MODULES.lighting.enabled,
  rgbMode: DEFAULT_MODULES.lighting.mode,
  rgbColor: DEFAULT_MODULES.lighting.color,
  cable: {
    ...DEFAULT_DESK_SETUP.cable,
  },
  oled: {
    enabled: DEFAULT_MODULES.oled.enabled,
    display: DEFAULT_MODULES.oled.display,
  },
}

/**
 * 全量默认配置聚合对象：供需要整包回退的调用方使用。
 */
export const DEFAULT_KEYBOARD_CONFIG: KeyboardConfig = {
  layout: DEFAULT_LAYOUT,
  case: DEFAULT_CASE,
  internals: DEFAULT_INTERNALS,
  switches: DEFAULT_SWITCHES,
  keycaps: DEFAULT_KEYCAPS,
  modules: DEFAULT_MODULES,
  deskSetup: DEFAULT_DESK_SETUP,
  acousticOverrides: DEFAULT_ACOUSTIC_OVERRIDES,
}
