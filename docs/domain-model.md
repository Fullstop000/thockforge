# ThockForge 域模型开发指导

## 目标
统一参数归属，避免“同一物理对象在多个域重复配置”导致的维护与渲染冲突。

## 持久化配置域（v3）
1. `layout`
- 负责配列、标准（ANSI/ISO/JIS）、变体（standard/hhkb/thinkpad_style）与特殊构造开关。

2. `case`
- 负责外壳、工艺、配重、螺丝等机身结构。

3. `internals`
- 负责定位板、填充、改模（Tape/Holee/PE Foam）与空格棉。

4. `switches`
- 负责轴体材料、弹簧、润滑、卫星轴与 O-Ring。

5. `keycaps`
- 负责键帽分区参数、单键覆盖、Artisan 绑定。

6. `modules`
- 负责板载模块能力：OLED、旋钮、TrackPoint、灯效控制。

7. `deskSetup`
- 负责桌面生态：桌垫、桌面材质、线材。

## 非持久化域
- `runtime`：当前按键、typing stats、overlay 事件。

## 派生层
- `acoustics`：由 `layout/case/internals/switches/keycaps/modules/deskSetup` 推导。
- 只允许少量 `acousticOverrides` 做后期调味，避免与物理参数形成双重真相。

## 参数归属矩阵（关键规则）
- `Spacebar Foam -> internals.foams.spacebarFoam`
- `O-Rings -> switches.orings`
- `OLED/Knob/TrackPoint -> modules`
- `桌垫/线材 -> deskSetup`
- `键帽 profile/厚度/字符/旧化 -> keycaps`

## 归属判定准则
新增参数时按以下顺序判断：
1. 物理所属对象是谁。
2. 该参数是否应进入 Build Code 持久化。
3. 是否会与现有域产生重复定义。
4. 是否需要作为派生结果而不是源参数。

若出现跨域影响：
- 参数只保留一个“主域”。
- 其他域通过派生逻辑消费该参数，不复制存储。

## Build Code 版本策略
- 当前导出：v3
- 兼容导入：v2、v3
- v2 `environment` 自动迁移：
  - `deskmat* / cable -> deskSetup`
  - `rgb* / oled* -> modules`

## 扩展流程（必须同步）
新增参数字段时必须同步：
1. `src/types/*`（类型与默认值）
2. `src/store/useKeyboardStore.ts`（merge/normalize/import/export）
3. `src/visual/parameterEffects.ts`（路径、文案、格式化）
4. `src/components/ui/ControlPanel.tsx`（控件入口）
5. `src/components/3d/*` 与 `src/audio/AudioEngine.ts`（可视/声学映射）
6. `tests/*.test.cjs`（覆盖与迁移回归）
