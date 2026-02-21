const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')

function read(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8')
}

function exists(relativePath) {
  return fs.existsSync(path.join(rootDir, relativePath))
}

test('Keycap façade uses derive layer and scheduler, and removes ring overlay geometry', () => {
  const keycapSource = read('src/components/3d/Keycap.tsx')

  assert.ok(keycapSource.includes('deriveRenderParams'), 'Keycap façade should derive params from unified engine')
  assert.ok(keycapSource.includes('keyAnimationScheduler'), 'Keycap façade should delegate integration to scheduler')
  assert.ok(keycapSource.includes('<KeycapAssembly'), 'Keycap façade should delegate geometry assembly')
  assert.ok(!keycapSource.includes('ringGeometry'), 'Keycap façade must not keep non-physical ring overlay geometry')
  assert.ok(!keycapSource.includes('PROFILE_SHAPES'), 'Keycap façade should not keep local profile truth table')
})

test('Turntable/three-view/cross-section consume unified render derivation', () => {
  const turntableSource = read('src/components/ui/KeycapTurntable.tsx')
  const threeViewSource = read('src/components/ui/KeycapThreeView.tsx')
  const crossSectionSource = read('src/components/ui/SwitchCrossSection.tsx')

  assert.ok(turntableSource.includes('deriveKeycapRenderParamsFromZone'), 'Turntable should consume keycap derive params')
  assert.ok(threeViewSource.includes('resolveProfileBlueprintGeometry'), 'Three-view should consume profile blueprint derive params')
  assert.ok(crossSectionSource.includes('resolveSwitchBlueprintMetrics'), 'Cross-section should consume switch blueprint derive params')

  assert.ok(!turntableSource.includes('MATERIAL_PRESETS'), 'Turntable should not keep duplicated material preset table')
})

test('Main scene enables budget-driven quality degrade path', () => {
  const sceneSource = read('src/components/3d/KeyboardScene.tsx')

  assert.ok(sceneSource.includes('RenderQualityGovernor'), 'Keyboard scene should register quality governor')
  assert.ok(sceneSource.includes('RENDER_GEOMETRY_BUDGETS'), 'Governor should evaluate against geometry budgets')
  assert.ok(sceneSource.includes('quality={renderQuality}'), 'Keycap should receive runtime quality tier')
})

test('Animation scheduler enforces tilt bounds to prevent keycap flipping', () => {
  const schedulerSource = read('src/engine/keyAnimationScheduler.ts')
  const keycapSource = read('src/components/3d/Keycap.tsx')

  assert.ok(schedulerSource.includes('MAX_TILT_X'), 'Scheduler should define X tilt safety cap')
  assert.ok(schedulerSource.includes('MAX_TILT_Z'), 'Scheduler should define Z tilt safety cap')
  assert.ok(schedulerSource.includes('sanitizeState'), 'Scheduler should sanitize non-finite integration state')
  assert.ok(keycapSource.includes('clampedTiltX'), 'Keycap should clamp tiltX before applying rotation')
  assert.ok(keycapSource.includes('clampedTiltZ'), 'Keycap should clamp tiltZ before applying rotation')
  assert.ok(keycapSource.includes('lateralJitterLimit'), 'Keycap should clamp jitter with mount-derived limit')
  assert.ok(keycapSource.includes('maxTravelByCase'), 'Keycap should clamp travel against case floor guard')
})

test('Case model keeps key area open instead of full solid top blocker', () => {
  const caseSource = read('src/components/3d/KeyboardCase.tsx')

  assert.ok(caseSource.includes('开口框体机壳'), 'Keyboard case should declare open frame shell modeling')
  assert.ok(!caseSource.includes('layoutWidth - 0.002'), 'Keyboard case should not place a full-width top blocking plate')
})

test('Governance and acceptance docs exist', () => {
  const requiredDocs = [
    'docs/hifi-rendering-governance.md',
    'docs/keycap-switch-implementation-spec.md',
    'docs/constraint-kinematic-switch-realism-plan.md',
    'docs/rendering-acceptance-checklist.md',
    'docs/baselines/screenshots/.gitkeep',
    'docs/baselines/perf/.gitkeep',
  ]

  for (const docPath of requiredDocs) {
    assert.ok(exists(docPath), `Missing required governance artifact: ${docPath}`)
  }
})

test('Derive layer exposes structure and mount outputs from a single source of truth', () => {
  const deriveSource = read('src/engine/deriveRenderParams.ts')
  const renderingModelSource = read('src/types/renderingModel.ts')

  assert.ok(deriveSource.includes('switchStructure'), 'deriveRenderParams should expose switchStructure result')
  assert.ok(deriveSource.includes('keycapMount'), 'deriveRenderParams should expose keycapMount result')
  assert.ok(deriveSource.includes('assemblyLite'), 'deriveRenderParams should expose assemblyLite result')
  assert.ok(renderingModelSource.includes('SwitchStructuralPreset'), 'rendering model should include switch structural preset type')
  assert.ok(renderingModelSource.includes('KeycapMountPreset'), 'rendering model should include keycap mount preset type')
  assert.ok(renderingModelSource.includes('AssemblyDatumLite'), 'rendering model should include assembly datum lite type')
})

test('Switch and keycap assemblies carry detachable semantics', () => {
  const switchAssemblySource = read('src/components/3d/switch/SwitchAssembly.tsx')
  const keycapAssemblySource = read('src/components/3d/keycap/KeycapAssembly.tsx')

  assert.ok(switchAssemblySource.includes('stemGroupRef'), 'Switch assembly should expose moving stem group ref')
  assert.ok(switchAssemblySource.includes('Metal leaf'), 'Switch assembly should model metal leaf structure')
  assert.ok(switchAssemblySource.includes('Pins:'), 'Switch assembly should model contact pins')
  assert.ok(switchAssemblySource.includes('switchOpacity'), 'Switch assembly should support opacity-based hide path')
  assert.ok(keycapAssemblySource.includes('Stem socket'), 'Keycap assembly should model stem socket geometry')
  assert.ok(keycapAssemblySource.includes('reinforcing ribs'), 'Keycap assembly should include socket reinforcement ribs')
  assert.ok(keycapAssemblySource.includes('keycapOpacity'), 'Keycap assembly should support opacity-based hide path')
})

test('Control panel exposes hide-all controls and render self-check entry', () => {
  const panelSource = read('src/components/ui/ControlPanel.tsx')
  const sceneSource = read('src/components/3d/KeyboardScene.tsx')
  const runtimeSource = read('src/types/keyboardRuntime.ts')
  const storeSource = read('src/store/useKeyboardStore.ts')
  const validationSource = read('src/engine/renderValidation.ts')

  assert.ok(panelSource.includes('移除所有键帽'), 'Control panel should include remove-all-keycaps button')
  assert.ok(panelSource.includes('移除所有轴体'), 'Control panel should include remove-all-switches button')
  assert.ok(panelSource.includes('运行渲染自检'), 'Control panel should include render self-check action')
  assert.ok(sceneSource.includes('renderVisibility'), 'Keyboard scene should consume runtime render visibility state')
  assert.ok(runtimeSource.includes('RenderVisibilityState'), 'Runtime model should define render visibility state')
  assert.ok(storeSource.includes('toggleHideKeycaps'), 'Store should expose hide-keycaps action')
  assert.ok(storeSource.includes('toggleHideSwitches'), 'Store should expose hide-switches action')
  assert.ok(validationSource.includes('runRenderValidation'), 'Engine should provide render validation utility')
})
