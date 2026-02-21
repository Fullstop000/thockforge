const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')

function read(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8')
}

test('Build import path has v3 versioning and v2 migration guard rails', () => {
  const storeSource = read('src/store/useKeyboardStore.ts')
  const buildCodeSource = read('src/store/keyboard/buildCode.ts')

  assert.ok(buildCodeSource.includes('v: 3'), 'Build encoder should include v3 version marker')
  assert.ok(buildCodeSource.includes('decodeBuildPayload'), 'Build module should decode payload via guarded parser')
  assert.ok(buildCodeSource.includes('version !== 2 && version !== 3'), 'Build module should reject unsupported payload versions')
  assert.ok(buildCodeSource.includes('migrateEnvironmentToV3'), 'Build module should expose v2 environment migration adapter')
  assert.ok(storeSource.includes('decodeBuildCode(code)'), 'Store should import and use build decode gate')
  assert.ok(storeSource.includes('encodeBuildCodeV3'), 'Store should import and use build encode function')
  assert.ok(storeSource.includes('normalizeLayoutConfig'), 'Store should normalize layout payload before set')
  assert.ok(storeSource.includes('normalizeModulesConfig'), 'Store should normalize modules payload before set')
  assert.ok(storeSource.includes('normalizeDeskSetupConfig'), 'Store should normalize desk setup payload before set')
  assert.ok(storeSource.includes("emitSummaryEvent('导入失败'"), 'Store should emit user-visible import failure event')
  assert.ok(storeSource.includes('v2 已迁移到 v3'), 'Store should emit migration summary for v2 import')
})

test('Keyboard code map contains critical physical key mappings', () => {
  const sceneSource = read('src/components/3d/KeyboardScene.tsx')

  const requiredMappings = [
    "Space: 'space'",
    "Backspace: 'backspace'",
    "ShiftLeft: 'lshift'",
    "ShiftRight: 'rshift'",
    "ControlLeft: 'lctrl'",
    "ControlRight: 'rctrl'",
    "MetaLeft: 'lwin'",
    "MetaRight: 'rwin'",
    "NumpadEnter: 'numenter'",
  ]

  for (const mapping of requiredMappings) {
    assert.ok(sceneSource.includes(mapping), `Missing key mapping: ${mapping}`)
  }

  assert.ok(sceneSource.includes('mapKeyboardEventToKeyId'), 'Scene should resolve browser key events to layout key ids')
})
