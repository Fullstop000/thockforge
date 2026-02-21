const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')

function read(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8')
}

function extractBetween(content, startMark, endMark) {
  const start = content.indexOf(startMark)
  const end = content.indexOf(endMark)
  if (start === -1 || end === -1 || end <= start) {
    return ''
  }
  return content.slice(start + startMark.length, end)
}

function extractQuotedValues(section) {
  const values = []
  const regex = /'([^']+)'/g
  for (const match of section.matchAll(regex)) {
    values.push(match[1])
  }
  return values
}

test('ParameterPath and descriptor mapping stay in sync', () => {
  const typesSource = read('src/types/keyboardFeedback.ts')
  const effectsSource = read('src/visual/parameterEffects.ts')

  const unionSection = extractBetween(typesSource, 'export type ParameterPath =', 'export interface ParameterEffectDescriptor')
  const descriptorSection = extractBetween(effectsSource, 'const DESCRIPTORS:', 'export const PARAMETER_EFFECTS')

  const paths = new Set(extractQuotedValues(unionSection))
  const descriptorKeys = new Set(Array.from(descriptorSection.matchAll(/\s*'([^']+)'\s*:\s*\{/g), (m) => m[1]))

  assert.ok(paths.size > 0, 'ParameterPath union should not be empty')
  assert.equal(paths.size, descriptorKeys.size, 'Each ParameterPath must have a descriptor')

  for (const paramPath of paths) {
    assert.ok(descriptorKeys.has(paramPath), `Missing descriptor for ${paramPath}`)
  }
})

test('Core domain parameters have visible implementation hooks', () => {
  const implementationSources = [
    read('src/components/3d/KeyboardCase.tsx'),
    read('src/components/3d/KeyboardScene.tsx'),
    read('src/components/3d/Keycap.tsx'),
    read('src/components/3d/keycap/KeycapAssembly.tsx'),
    read('src/components/3d/InternalsPreview.tsx'),
    read('src/components/3d/OledPanel.tsx'),
    read('src/engine/deriveRenderParams.ts'),
    read('src/components/ui/ControlPanel.tsx'),
    read('src/store/useKeyboardStore.ts'),
    read('src/audio/AudioEngine.ts'),
  ].join('\n')

  const requiredTokens = [
    'store.layout.formFactor',
    'store.layout.standard',
    'store.layout.variant',
    'specialStructure.hhkbBlockers',

    'config.material',
    'config.finish',
    'config.mount',
    'config.weight.enabled',

    'config.foams.spacebarFoam',
    'switches.orings.enabled',
    'switches.orings.thickness',

    'zoneConfig.profile',
    'zoneConfig.thickness.topMm',
    'zoneConfig.legendPosition',
    'zoneConfig.wearShineLevel',
    'keycaps.overrides',
    'artisan.items',

    'modules.oled.enabled',
    'modules.knob.enabled',
    'modules.trackpoint.enabled',
    'modules.lighting.mode',

    'deskSetup.deskmat',
    'deskSetup.cable.enabled',

    'acousticOverrides.brightness',
    'calculateAcousticProfile',
  ]

  for (const token of requiredTokens) {
    assert.ok(implementationSources.includes(token), `Expected implementation token: ${token}`)
  }
})
