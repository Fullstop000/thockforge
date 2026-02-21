# ThockForge Hi-Fi Rendering Governance

## 1. Scope And Hard Constraints
- 目标等级：结构级真实（Structure-Grade Realism）。
- 性能优先级：中端设备 60 FPS 为硬约束，高于特效完整度。
- 生效范围：主场景、转台、三视图、剖面图、截图回归、性能回归。
- 当前阶段计划：`docs/constraint-kinematic-switch-realism-plan.md`。

## 2. Single Source Of Truth
1. 单一真源规则：profile/material/switch/dynamics 参数只允许在 `src/types/renderingModel.ts` + `src/engine/deriveRenderParams.ts` 定义。
2. 视图消费规则：主场景、转台、三视图、剖面图只允许调用推导层，不允许各自硬编码 profile/switch 映射。
3. 参数新增规则：新增字段必须同步更新 `types/store/rendering-mapping/tests/docs`。

## 3. Geometry And Assembly Rules
1. 单位规则：内部几何/运动统一为米（m），UI 标注统一转换为毫米（mm）。
2. 顶面拓扑规则：键帽顶面必须由连续曲面表达凹碟，不得叠加近平面模拟凹陷。
3. 禁用伪影规则：生产渲染禁止 ring overlay、假高光环、假阴影补轮廓几何。
4. 装配约束规则：keycap/stem/top housing/bottom housing/spring/stabilizer 保持真实相对约束，不允许穿模。
5. 独立实体规则：轴体必须作为可拆装语义独立实体存在，stem 作为唯一核心动件，禁止键帽直接驱动壳体静件。
6. 挂点规则：键帽必须包含 socket + cross-slot + reinforcing ribs，挂点尺寸只能来自推导层真源。
7. 光照稳定规则：主灯光 rig 固定且可复现，交互过程中不得重建灯光对象。

## 4. Animation Rules
1. 动力学统一规则：位移、回弹、过冲、横向抖动统一来源于 `deriveAnimationParams + deriveSwitchRenderParams`。
2. 无补偿脚本规则：禁止在各组件局部追加“手写补偿”破坏统一动力学。
3. 调度规则：按需积分，仅对活跃键及未静止键持续积分；静止键禁止高频积分。
4. 容错规则：动画异常时必须回落到稳定静止位姿，不能传播 NaN 到渲染节点。
5. 阶段边界规则：在求解器上线前，只允许轻约束 clamp（travel/tilt/jitter），禁止引入重型刚体积分路径。

## 5. Material And Color Rules
1. PBR 约束规则：roughness/metalness/clearcoat 必须在物理区间 `[0,1]`，并走材质族预设。
2. 颜色空间规则：输入颜色按 sRGB，渲染计算按线性空间输出。
3. 退化规则：贴图/模型加载失败必须 fallback 到稳定占位材质，不阻塞帧循环。

## 6. Performance Budgets (60% Layout, Mid View)
- `high`: draw calls <= 450, triangles <= 560k, CPU <= 6ms, GPU <= 8ms。
- `balanced`: draw calls <= 320, triangles <= 360k, CPU <= 5ms, GPU <= 6.5ms。
- `performance`: draw calls <= 220, triangles <= 220k, CPU <= 4ms, GPU <= 5.5ms。

### 6.1 Degrade Policy
- 先降次要效果，再保核心几何：
- 降级顺序：顶面细分 -> 次级高光/辅助效果 -> 远景阴影质量。
- 不允许降级核心结构件（stem/switch assembly）到失真形态。

## 7. Baselines And Regression
- 固定机位截图基线：
- 建议目录：`docs/baselines/screenshots/`。
- 视角集合：主场景 2 个角度 + 转台 1 个角度 + 三视图 + 剖面图。
- 性能采样基线：
- 建议目录：`docs/baselines/perf/`。
- 指标必须包含 draw calls、triangles、cpu frame time、gpu frame time。
- 每次改动必须提交前后对比数据与超预算说明。

## 8. Review Checklist (PR Gate)
- 是否存在重复参数真源。
- 是否引入非物理装饰几何。
- 主场景与侧视图参数是否一致。
- 是否保留 fallback 容错路径。
- 是否更新 tests/docs。
- 是否提交性能采样结果。
