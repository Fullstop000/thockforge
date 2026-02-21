# ThockForge 键帽域规范（v1）

## 模型目标
采用“分区 + 单键覆盖”模型：
- 分区满足大部分调参效率。
- 覆盖保证极致客制化（少量关键键单独调）。

## 数据结构
`keycaps` 由三部分组成：
1. `zones: Record<KeycapZone, KeycapZoneConfig>`
2. `overrides: Record<keyId, Partial<KeycapZoneConfig>>`
3. `artisan: { enabled, items[] }`

## 分区定义
- `alpha`: 字母主区
- `modifier`: Ctrl/Shift/Alt/Fn 等
- `function`: F 区
- `nav`: 导航与方向键
- `numpad`: 数字区
- `space`: 空格及大键主区

## 字段说明（KeycapZoneConfig）
1. 几何与物理
- `profile`: cherry/oem/sa/xda/dsa/mt3/kat
- `rowSculpt`: uniform/sculpted
- `thickness.topMm`: 顶部厚度（mm，建议 1.0~2.2）
- `thickness.sideMm`: 侧壁厚度（mm，建议 0.8~2.0）

2. 材质与工艺
- `material`: pbt/abs/pc/pom/pbt_double/resin/ceramic/metal_alu/metal_brass
- `bodyManufacturing`: injection/cnc
- `legendManufacturing`: double_shot/dye_sub/laser/blank

3. 字符系统
- `legendPrimary`: latin/kana/cyrillic/hangul/fantasy/none
- `legendSub`: latin/kana/cyrillic/hangul/fantasy/none
- `legendPosition`: center/top_left/front_side/side_shine
- `legendOpacity`: 0~1

4. 视觉与旧化
- `theme`: 主题标识
- `colorway`: 配色标识
- `wearShineLevel`: 0~100
- `wearPattern`: uniform/wasd_focus/space_focus

5. 声学派生参数
- `hollowFactor`: 0.5~1.5

## 优先级规则
- 最终渲染参数 = `zone 配置` + `override（若存在）`
- 覆盖优先于分区。
- 覆盖仅作用于对应 `keyId`。

## Artisan 规范
`artisan.items[]` 字段：
- `keyId`: 目标键
- `url`: 资源地址
- `materialHint`: resin/metal/stone/other（可选）

渲染建议：
- 若资源不可用，使用本地 fallback 几何体。
- 失败时不得中断主场景渲染。

## 与声学层关系
- 键帽域只提供“物理相关输入”（厚度、空腔、材质）。
- 实际音色由声学引擎统一派生。
- 不在键帽域直接存储完整 EQ/混响曲线。

## 最小验收
1. 任一分区参数变更可在 150ms 内看到可视反馈。
2. 任一覆盖参数生效后，该 key 与所在分区存在可见差异。
3. `wearShineLevel` 与 `thickness` 至少同时影响渲染与声学派生。
4. Artisan 资源失效时有 fallback 且不会导致崩溃。
