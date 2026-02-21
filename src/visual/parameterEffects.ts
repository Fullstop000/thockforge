import {
  ParameterEffectDescriptor,
  ParameterPath,
  VisualFeedbackEvent,
} from '@/types/keyboard'

type ValueFormatter = (value: unknown) => string

type DescriptorWithFormat = Omit<ParameterEffectDescriptor, 'path'> & {
  format?: ValueFormatter
}

const BOOL_LABELS = {
  true: '开启',
  false: '关闭',
}

const STRING_LABELS: Partial<Record<ParameterPath, Record<string, string>>> = {
  'layout.formFactor': {
    '40': '40%',
    '60': '60%',
    '65': '65%',
    '75': '75%',
    '80': 'TKL',
    '980': '1800',
    '100': '100%',
    alice: 'Alice',
  },
  'layout.standard': {
    ansi: 'ANSI',
    iso: 'ISO',
    jis: 'JIS',
  },
  'layout.variant': {
    standard: '标准',
    hhkb: 'HHKB',
    thinkpad_style: 'ThinkPad 风格',
  },
  'case.material': {
    alu_6063: '铝 6063',
    alu_7075: '铝 7075',
    pc: 'PC',
    acrylic: '亚克力',
    abs: 'ABS',
    wood: '木材',
  },
  'case.mount': {
    gasket_poron: 'Poron Gasket',
    gasket_silicone: '硅胶 Gasket',
    top: 'Top Mount',
    tray: 'Tray Mount',
    oring_burger: 'O-Ring Burger',
    plateless: 'Plateless',
  },
  'switches.type': {
    linear: '线性轴',
    tactile: '段落轴',
    clicky: '点击轴',
    silent: '静音轴',
  },
  'switches.springType': {
    single: '单段弹簧',
    extended: '加长弹簧',
    progressive: '渐进弹簧',
  },
  'switches.orings.thickness': {
    thin: '薄圈',
    thick: '厚圈',
  },
  'keycaps.zones.profile': {
    cherry: 'Cherry',
    sa: 'SA',
    oem: 'OEM',
    xda: 'XDA',
    dsa: 'DSA',
    mt3: 'MT3',
    kat: 'KAT',
  },
  'keycaps.zones.material': {
    pbt: 'PBT',
    abs: 'ABS',
    pc: 'PC',
    pom: 'POM',
    pbt_double: 'PBT 二色',
    resin: '树脂',
    ceramic: '陶瓷',
    metal_alu: '铝金属',
    metal_brass: '黄铜金属',
  },
  'modules.oled.display': {
    wpm: 'WPM',
    time: '时间',
    gif: 'GIF',
    custom: '自定义',
  },
  'modules.oled.position': {
    top_right: '右上',
    top_left: '左上',
    center: '中置',
  },
  'modules.knob.position': {
    top_right: '右上',
    right_edge: '右侧边',
    left_edge: '左侧边',
  },
  'modules.knob.detent': {
    soft: '柔和段落',
    hard: '硬朗段落',
  },
  'modules.trackpoint.capType': {
    classic: '经典帽',
    soft_rim: '软边帽',
    low_profile: '低矮帽',
  },
  'modules.trackpoint.zone': {
    g_h_b: 'G/H/B 区',
    center_cluster: '中部键区',
  },
  'modules.lighting.mode': {
    static: '静态',
    wave: '波浪',
    reactive: '触发',
    rainbow: '彩虹',
  },
  'deskSetup.deskmat': {
    none: '无桌垫',
    cloth: '布面',
    glass: '玻璃',
    leather: '皮面',
    wood: '木面',
  },
  'deskSetup.deskSurface': {
    wood: '木桌面',
    glass: '玻璃桌面',
    stone: '石材桌面',
    laminate: '复合板桌面',
  },
  'deskSetup.cable.type': {
    aviator: '航插',
    lemo: 'LEMO',
    coiled_usb: '卷线 USB',
    straight_usb: '直线 USB',
  },
}

const DESCRIPTORS: Record<ParameterPath, DescriptorWithFormat> = {
  'layout.formFactor': { label: '配列', effect: '主键位布局已更新' },
  'layout.standard': { label: '键位标准', effect: '物理标准映射已更新' },
  'layout.variant': { label: '布局变体', effect: '特殊布局规则已更新' },
  'layout.specialStructure.hhkbBlockers': { label: 'HHKB Blocker', effect: 'HHKB 构造可视件已更新' },
  'layout.specialStructure.trackpointCluster': { label: 'TrackPoint 键区', effect: 'TrackPoint 键区约束已更新' },

  'case.material': { label: '外壳材质', effect: '机身材质观感已切换' },
  'case.finish': { label: '外壳工艺', effect: '表面反射与粗糙度已更新' },
  'case.mount': { label: '固定结构', effect: '安装结构示意件已更新' },
  'case.weight.enabled': { label: '底部配重', effect: '底部配重显示状态已更新' },
  'case.weight.material': { label: '配重材质', effect: '配重金属色调已切换' },
  'case.weight.finish': { label: '配重工艺', effect: '配重表面工艺表现已更新' },
  'case.screws.type': { label: '螺丝类型', effect: '螺丝几何形态已更新' },
  'case.screws.finish': { label: '螺丝表面', effect: '螺丝镀层颜色已更新' },

  'internals.plateMaterial': { label: '定位板材质', effect: '内构定位板观感已更新' },
  'internals.plateFlexCuts': { label: '定位板开槽', effect: '联动形变预览已更新' },
  'internals.foams.caseFoam': { label: '底棉', effect: '底棉层可视状态已更新' },
  'internals.foams.plateFoam': { label: '夹心棉', effect: '夹心层可视状态已更新' },
  'internals.foams.peSheet': { label: 'PE 轴下垫', effect: 'PE 层可视状态已更新' },
  'internals.foams.ixpe': { label: 'IXPE 轴下垫', effect: 'IXPE 层可视状态已更新' },
  'internals.foams.spacebarFoam': { label: '空格棉', effect: '空格键消音配置已更新' },
  'internals.mods.tapeMod': { label: 'Tape Mod', effect: 'PCB 背面胶带层数已更新', format: (value) => `${Number(value) || 0} 层` },
  'internals.mods.holeeMod': { label: 'Holee Mod', effect: '卫星轴阻尼预览已更新' },
  'internals.mods.peFoamMod': { label: 'PE Foam Mod', effect: '额外底轴垫可视层已更新' },

  'switches.type': { label: '轴体类型', effect: '轴体视觉风格与按压曲线已更新' },
  'switches.materials.top': { label: '上盖材质', effect: '轴体上盖色泽已更新' },
  'switches.materials.stem': { label: '轴心材质', effect: '轴心色彩高光已更新' },
  'switches.materials.bottom': { label: '底壳材质', effect: '轴体底壳外观已更新' },
  'switches.springWeight': {
    label: '弹簧克数',
    effect: '按键回弹速度与力度已更新',
    format: (value) => `${Number(value) || 0}g`,
  },
  'switches.springType': { label: '弹簧类型', effect: '按压回弹曲线已更新' },
  'switches.lube': { label: '润滑状态', effect: '轴体光泽与摩擦观感已更新' },
  'switches.film': { label: '轴间纸', effect: '轴体接缝高亮已更新' },
  'switches.stabilizerQuality': { label: '卫星轴状态', effect: '大键抖动预览已更新' },
  'switches.orings.enabled': { label: '静音圈', effect: 'O-Ring 启用状态已更新' },
  'switches.orings.thickness': { label: '静音圈厚度', effect: 'O-Ring 行程截断强度已更新' },

  'keycaps.zones.profile': { label: '键帽高度', effect: '分区键帽高度轮廓已更新' },
  'keycaps.zones.rowSculpt': { label: '行列雕刻', effect: '分区键帽行列曲率已更新' },
  'keycaps.zones.thickness.topMm': { label: '顶部厚度', effect: '键帽顶部厚度映射已更新', format: (value) => `${Number(value) || 0}mm` },
  'keycaps.zones.thickness.sideMm': { label: '侧壁厚度', effect: '键帽侧壁厚度映射已更新', format: (value) => `${Number(value) || 0}mm` },
  'keycaps.zones.material': { label: '键帽材质', effect: '键帽分区材质表现已更新' },
  'keycaps.zones.bodyManufacturing': { label: '本体工艺', effect: '键帽本体工艺表现已更新' },
  'keycaps.zones.legendManufacturing': { label: '字符工艺', effect: '字符成型工艺已更新' },
  'keycaps.zones.legendPrimary': { label: '主字符语言', effect: '主字符语言包已更新' },
  'keycaps.zones.legendSub': { label: '副字符语言', effect: '副字符语言包已更新' },
  'keycaps.zones.legendPosition': { label: '印字位置', effect: '字符投影位置已更新' },
  'keycaps.zones.legendOpacity': { label: '字符透明度', effect: '字符透光/透明度已更新' },
  'keycaps.zones.theme': { label: '键帽主题', effect: '键帽纹理主题已更新' },
  'keycaps.zones.colorway': { label: '配色方案', effect: '键帽分区配色已更新' },
  'keycaps.zones.wearShineLevel': { label: '打油旧化', effect: '旧化高光强度已更新', format: (value) => `${Number(value) || 0}%` },
  'keycaps.zones.wearPattern': { label: '旧化分布', effect: '旧化分布模型已更新' },
  'keycaps.zones.hollowFactor': { label: '空腔系数', effect: '键帽空腔声学因子已更新' },
  'keycaps.overrides': { label: '单键覆盖', effect: '单键覆盖配置已更新' },
  'keycaps.artisan.enabled': { label: 'Artisan 开关', effect: '个性键帽启用状态已更新' },
  'keycaps.artisan.items': { label: 'Artisan 列表', effect: '个性键帽绑定已更新' },

  'modules.oled.enabled': { label: 'OLED', effect: 'OLED 模块显示状态已更新' },
  'modules.oled.display': { label: 'OLED 内容', effect: 'OLED 显示模板已更新' },
  'modules.oled.position': { label: 'OLED 位置', effect: 'OLED 安装位置已更新' },
  'modules.knob.enabled': { label: '旋钮', effect: '旋钮模块显示状态已更新' },
  'modules.knob.count': { label: '旋钮数量', effect: '旋钮数量已更新' },
  'modules.knob.position': { label: '旋钮位置', effect: '旋钮安装位置已更新' },
  'modules.knob.detent': { label: '旋钮阻尼', effect: '旋钮段落阻尼已更新' },
  'modules.trackpoint.enabled': { label: 'TrackPoint', effect: 'TrackPoint 模块显示状态已更新' },
  'modules.trackpoint.color': { label: 'TrackPoint 颜色', effect: 'TrackPoint 颜色已更新' },
  'modules.trackpoint.capType': { label: 'TrackPoint 帽型', effect: 'TrackPoint 帽型已更新' },
  'modules.trackpoint.sensitivity': { label: 'TrackPoint 灵敏度', effect: 'TrackPoint 灵敏度已更新' },
  'modules.trackpoint.zone': { label: 'TrackPoint 区域', effect: 'TrackPoint 安装区域已更新' },
  'modules.lighting.enabled': { label: '灯效开关', effect: '板载灯效启用状态已更新' },
  'modules.lighting.mode': { label: '灯效模式', effect: '板载灯效模式已更新' },
  'modules.lighting.color': { label: '灯效颜色', effect: '板载灯效颜色已更新' },
  'modules.lighting.reactiveSpread': { label: '灯效扩散', effect: '触发扩散范围已更新' },

  'deskSetup.deskmat': { label: '桌垫材质', effect: '桌垫材质已更新' },
  'deskSetup.deskmatColor': { label: '桌垫颜色', effect: '桌垫颜色已更新' },
  'deskSetup.deskSurface': { label: '桌面材质', effect: '桌面反射材质已更新' },
  'deskSetup.cable.enabled': { label: '线材显示', effect: '连接线显示状态已更新' },
  'deskSetup.cable.type': { label: '线材类型', effect: '连接线接头形态已更新' },
  'deskSetup.cable.color': { label: '线材颜色', effect: '连接线颜色已更新' },

  'acousticOverrides.brightness': { label: '声学亮度', effect: '高频亮度覆盖已更新' },
  'acousticOverrides.dampening': { label: '声学阻尼', effect: '阻尼覆盖已更新' },
  'acousticOverrides.reverb': { label: '混响覆盖', effect: '混响覆盖已更新' },

  'environment.deskmat': { label: '旧环境-桌垫', effect: '已迁移到 deskSetup.deskmat' },
  'environment.deskmatColor': { label: '旧环境-桌垫色', effect: '已迁移到 deskSetup.deskmatColor' },
  'environment.rgbEnabled': { label: '旧环境-RGB', effect: '已迁移到 modules.lighting.enabled' },
  'environment.rgbMode': { label: '旧环境-RGB模式', effect: '已迁移到 modules.lighting.mode' },
  'environment.rgbColor': { label: '旧环境-RGB颜色', effect: '已迁移到 modules.lighting.color' },
  'environment.cable.enabled': { label: '旧环境-线材', effect: '已迁移到 deskSetup.cable.enabled' },
  'environment.cable.type': { label: '旧环境-线材类型', effect: '已迁移到 deskSetup.cable.type' },
  'environment.cable.color': { label: '旧环境-线材颜色', effect: '已迁移到 deskSetup.cable.color' },
  'environment.oled.enabled': { label: '旧环境-OLED', effect: '已迁移到 modules.oled.enabled' },
  'environment.oled.display': { label: '旧环境-OLED内容', effect: '已迁移到 modules.oled.display' },
}

export const PARAMETER_EFFECTS: Record<ParameterPath, ParameterEffectDescriptor> = Object.fromEntries(
  (Object.keys(DESCRIPTORS) as ParameterPath[]).map((path) => [
    path,
    {
      path,
      label: DESCRIPTORS[path].label,
      effect: DESCRIPTORS[path].effect,
    },
  ])
) as Record<ParameterPath, ParameterEffectDescriptor>

export const ALL_PARAMETER_PATHS = Object.keys(PARAMETER_EFFECTS) as ParameterPath[]

export const LAYOUT_PARAMETER_PATHS = ALL_PARAMETER_PATHS.filter((path) => path.startsWith('layout.')) as ParameterPath[]
export const CASE_PARAMETER_PATHS = ALL_PARAMETER_PATHS.filter((path) => path.startsWith('case.')) as ParameterPath[]
export const INTERNALS_PARAMETER_PATHS = ALL_PARAMETER_PATHS.filter((path) => path.startsWith('internals.')) as ParameterPath[]
export const SWITCH_PARAMETER_PATHS = ALL_PARAMETER_PATHS.filter((path) => path.startsWith('switches.')) as ParameterPath[]
export const KEYCAP_PARAMETER_PATHS = ALL_PARAMETER_PATHS.filter((path) => path.startsWith('keycaps.')) as ParameterPath[]
export const MODULE_PARAMETER_PATHS = ALL_PARAMETER_PATHS.filter((path) => path.startsWith('modules.')) as ParameterPath[]
export const DESK_SETUP_PARAMETER_PATHS = ALL_PARAMETER_PATHS.filter((path) => path.startsWith('deskSetup.')) as ParameterPath[]
export const ACOUSTIC_PARAMETER_PATHS = ALL_PARAMETER_PATHS.filter((path) => path.startsWith('acousticOverrides.')) as ParameterPath[]
export const ENVIRONMENT_PARAMETER_PATHS = ALL_PARAMETER_PATHS.filter((path) => path.startsWith('environment.')) as ParameterPath[]

function formatColor(value: string): string {
  const normalized = value.trim()
  if (!normalized) {
    return '未设置'
  }
  if (!normalized.startsWith('#')) {
    return normalized
  }
  return normalized.toUpperCase()
}

function defaultFormatter(path: ParameterPath, value: unknown): string {
  if (typeof value === 'boolean') {
    return BOOL_LABELS[String(value) as keyof typeof BOOL_LABELS]
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '0'
  }

  if (typeof value === 'string') {
    if (path.endsWith('Color')) {
      return formatColor(value)
    }
    const labelMap = STRING_LABELS[path]
    if (labelMap && labelMap[value]) {
      return labelMap[value]
    }
    return value
  }

  if (value === null || value === undefined) {
    return '未设置'
  }

  return JSON.stringify(value)
}

/**
 * Convert a raw parameter value to user-facing text.
 */
export function formatParameterValue(path: ParameterPath, value: unknown): string {
  const descriptor = DESCRIPTORS[path]
  if (descriptor?.format) {
    return descriptor.format(value)
  }
  return defaultFormatter(path, value)
}

/**
 * Build a typed visual feedback event payload for overlay usage.
 */
export function createVisualFeedbackEvent(path: ParameterPath, value: unknown): VisualFeedbackEvent {
  const descriptor = PARAMETER_EFFECTS[path]
  return {
    kind: 'parameter',
    path,
    label: descriptor.label,
    value: formatParameterValue(path, value),
    effect: descriptor.effect,
    timestamp: Date.now(),
  }
}
