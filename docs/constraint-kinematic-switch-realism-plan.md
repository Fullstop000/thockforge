# ThockForge 文档与轴体/键帽高保真优先方案（暂缓求解器）

## 1. Summary
1. 本阶段不实现 `assemblyConstraintSolver`，优先完成文档冻结与结构真实性重建。
2. 重点提升 `SwitchAssembly` 与 `KeycapAssembly` 的装配语义和几何细节，采用 MX 参数化真源。
3. 动画继续沿用状态机（上下位移主导 + 旋转从属微扰），通过轻约束限幅确保稳定。
4. 目标是先达到“结构真实 + 视觉可信 + 无明显穿插”，再进入完整求解器阶段。

## 2. Scope And Non-Goals
- In Scope:
  - 渲染真源新增结构参数（switch 结构、keycap 挂点、轻量装配基准）。
  - `SwitchAssembly` 分层：静件与 stem 动件解耦。
  - `KeycapAssembly` 新增 socket 与加强筋语义，移除示意化 stem 几何。
  - `Keycap.tsx` 引入 travel/tilt/jitter 的硬限幅与异常容错。
- Out Of Scope:
  - 不引入 Rapier/Cannon/Ammo 等刚体库。
  - 不实现接触对约束求解器与迭代碰撞积分。
  - 不做 CAD 公差级几何复刻。

## 3. Public Interfaces / Type Changes
1. `src/types/renderingModel.ts`：
   - 新增 `SwitchStructuralPreset`。
   - 新增 `KeycapMountPreset`。
   - 新增 `AssemblyDatumLite`（静态装配基准）。
2. `src/engine/deriveRenderParams.ts`：
   - 聚合输出新增 `switchStructure`、`keycapMount`、`assemblyLite`。
   - 新增 `deriveSwitchStructureParams`、`deriveKeycapMountParams`、`deriveAssemblyDatumLite`。
3. `src/engine/keyAnimationScheduler.ts`：
   - 外部接口不变，不接入求解器。
4. `src/components/3d/Keycap.tsx`：
   - 外部 props 不变。
   - 内部统一消费新推导字段，执行轻约束 clamp。

## 4. Structural Realism Strategy
### 4.1 Switch
- 轴体作为独立可拆装语义实体：
  - `bottomHousing`（静件）
  - `topHousing`（静件）
  - `stem`（唯一主动态件）
  - `spring`（随行程压缩）
  - `metalLeaf/clickPart`（功能件）
  - `pins`（底部触点）
- 约束：键帽动态不直接驱动壳体静件，stem 才是键帽挂接的唯一动态中介。

### 4.2 Keycap
- 键帽结构必须包含：
  - 连续顶面凹碟曲面（禁止 ring overlay）。
  - 一体化裙边与可解释腔体壁厚。
  - stem socket + cross slot + reinforcing ribs。
- 约束：键帽 socket 尺寸全部来自 `keycapMount`，禁止组件内硬编码第二真源。

### 4.3 Animation Safety（Light Constraints）
- `travel`：`0 <= travel <= min(baseTravel, caseLimit)`。
- `tilt`：`|tiltX| <= 0.06rad`，`|tiltZ| <= 0.045rad`。
- `jitter`：严格限制在 `keycapMount.lateralJitterLimit`。
- 非法值（NaN/Inf）：立即回退到安全值并继续渲染。

## 5. Implementation Phases
1. Phase A：文档冻结与类型真源落地。
2. Phase B：重建 `SwitchAssembly` 静/动件层级。
3. Phase C：重建 `KeycapAssembly` 挂点语义。
4. Phase D：在 `Keycap.tsx` 接入轻约束限幅与容错。
5. Phase E：完成回归与性能门禁。

## 6. Test Cases And Scenarios
1. 构建：`npx tsc --noEmit`、`npm run lint`、`npm run build` 必须通过。
2. 结构：轴体组件包含独立壳体/簧片/引脚/动 stem。
3. 装配：键帽 socket 与 stem 在全行程不脱离、不反向穿插。
4. 动画：连续快速按键 60s 无无限翻转、无 NaN/Inf、无 React invariant。
5. 真实度：顶面高光连续，无 ring/半环伪影。
6. 性能：60% 布局 balanced 档保持 60FPS，超预算时仅降级次要效果。

## 7. Assumptions And Defaults
1. 本阶段目标是结构级可解释仿真，不是制造公差级仿真。
2. 参考采用 MX 参数化尺寸，不直接拷贝 keysim 网格拓扑。
3. 求解器阶段以本文件与类型接口作为后续唯一基线。
