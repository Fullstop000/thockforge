# Keycap/Switch Implementation Spec

## 1. Purpose
定义键帽与轴体在渲染层的结构约束、装配关系、动画方程与 LOD 策略，用于长期演进时保持真实性与性能边界。  
阶段计划见：`docs/constraint-kinematic-switch-realism-plan.md`。

## 2. Source Files
- 参数真源：`src/types/renderingModel.ts`
- 参数推导：`src/engine/deriveRenderParams.ts`
- 动画调度：`src/engine/keyAnimationScheduler.ts`
- 键帽 façade：`src/components/3d/Keycap.tsx`
- 键帽装配：`src/components/3d/keycap/KeycapAssembly.tsx`
- 轴体装配：`src/components/3d/switch/SwitchAssembly.tsx`
- 曲面工厂：`src/components/3d/keycap/KeycapGeometryFactory.ts`

## 3. Geometry Constraints
### 3.1 Keycap
- 顶面使用连续凹碟曲面（`createTopSurfaceGeometry`），禁止 ring overlay 叠加。
- 键帽尺寸由 `deriveKeycapRenderParams` 推导：`keyWidth/keyDepth/keyHeight/topPlate/topDishDepth`。
- 顶面、侧壁、腔体与挂点壁厚必须与 `thickness.topMm/sideMm` 联动。
- 键帽挂点由 `deriveKeycapMountParams` 推导：`socket/cross-slot/ribs`。

### 3.2 Switch
- 轴体几何由两组推导共同决定：
  - `deriveSwitchRenderParams`：行程/弹簧/阻尼/材质。
  - `deriveSwitchStructureParams`：壳体/stem/簧片/引脚结构尺寸。
- 轴体必须表达独立静件与动件语义：
  - 静件：`bottomHousing/topHousing/metalLeaf/pins`
  - 动件：`stem`
- O-Ring 与 Film 作为可选实体，启用时必须体现在结构件中。

## 4. Assembly Constraints
- 静态装配：`SwitchAssembly` 承担壳体、簧片、引脚、弹簧。
- 动态装配：`SwitchAssembly` 的 `stem` 为主动态件；`KeycapAssembly` 通过 socket 语义挂接。
- façade (`Keycap.tsx`) 负责参数编排、资源容错、动画采样和轻约束 clamp，不直接拼结构几何。

## 5. Animation Model
- 状态定义：`travel/velocity/tiltX/tiltZ/lateralJitter`。
- 本阶段动力学仍由 `keyAnimationScheduler` 提供，输出经过 façade 二次安全限幅：
  - `travel`：`0 <= travel <= min(baseTravel, caseLimit)`
  - `|tiltX| <= 0.06rad`
  - `|tiltZ| <= 0.045rad`
  - `|jitter| <= keycapMount.lateralJitterLimit`
- 非法值（NaN/Inf）必须回落到安全值，不得传播至渲染节点。

## 6. Solver Deferral Boundary
- 本阶段不实现 `assemblyConstraintSolver`。
- 仅允许“轻约束”：
  - 旅行边界 clamp
  - 倾角边界 clamp
  - 横向抖动边界 clamp
- 禁止引入接触对迭代求解与刚体积分，避免超出 60FPS 预算。

## 7. LOD And Degrade Strategy
- 质量档位：`high/balanced/performance`。
- 顶面细分来自 `RENDER_GEOMETRY_BUDGETS`，统一控制 `segmentsX/segmentsZ`。
- 超预算降级顺序：
  - 降低顶面细分。
  - 降低次级特效（非结构表现）。
  - 降低阴影与环境反射质量。
- 不允许削弱核心结构真实度（壳体、stem、socket 关系）。

## 8. Failure Handling
- artisan 资源失败：回退占位几何并标记 `invalid`，不得抛异常阻塞主循环。
- 参数越界：统一通过 `clamp` 裁剪到物理区间。
- 调度缺键：`registerKey` 自动补注册并返回稳定样本。

## 9. Cross-View Consistency
- 三视图、转台、剖面图统一消费推导层：
  - `resolveProfileBlueprintGeometry`
  - `resolveSwitchBlueprintMetrics`
  - `deriveKeycapRenderParamsFromZone`
- 禁止任何视图直接维护 profile/switch 的本地映射表。
