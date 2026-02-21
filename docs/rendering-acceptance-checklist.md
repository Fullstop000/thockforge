# Rendering Acceptance Checklist

## 1. Functional Integrity
- [ ] 主场景所有键位可正常按压与回弹。
- [ ] 转台、三视图、剖面图可随参数实时刷新。
- [ ] artisan 资源加载失败时可稳定 fallback。

## 2. Consistency Validation
- [ ] 同一 profile 在主场景/转台/三视图的高度和凹碟深度一致。
- [ ] 同一 switch 配置在主场景/剖面图中的行程与弹簧参数一致。
- [ ] 无视图私有 profile/switch 映射硬编码。

## 3. Realism Validation
- [ ] 键帽顶面无圆环/半环高光伪影。
- [ ] 顶面法线连续，无明显高光断裂。
- [ ] 关键装配关系无穿模（keycap/stem/switch/stabilizer）。
- [ ] 轴体包含独立实体分层（bottom/top housing、stem、metal leaf、pins）。
- [ ] 键帽包含 stem socket 与加强筋语义，且尺寸来自推导参数。
- [ ] 键帽腔体与挂点壁厚连续，无突兀断层。

## 4. Stability Validation
- [ ] 连续快速按键 60s 无状态错乱。
- [ ] 连续快速按键 60s 无无限翻转。
- [ ] 无 React invariant 错误。
- [ ] 无渲染线程异常日志（NaN transform / disposed texture use）。

## 5. Performance Gate (Mid-tier Device, 60% Layout)
- [ ] FPS 稳定 60。
- [ ] draw calls 在对应质量档预算内。
- [ ] triangles 在对应质量档预算内。
- [ ] CPU/GPU frame time 在预算内。
- [ ] 超预算时触发预期降级，不出现明显卡顿。

## 6. Regression Assets
- [ ] 提交固定机位截图对比（before/after）。
- [ ] 提交性能采样对比（before/after）。
- [ ] 记录本次质量档与预算阈值。

## 7. Engineering Hygiene
- [ ] `npm run test` 通过。
- [ ] `npm run lint` 通过。
- [ ] `npm run build` 通过。
- [ ] 参数变更同步更新 types/store/mapping/tests/docs。
