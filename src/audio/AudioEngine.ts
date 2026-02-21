import { AcousticOverrides, CaseConfig, InternalsConfig, KeycapConfig, KeycapZone, SwitchConfig } from '@/types/keyboard'

export interface AcousticProfile {
  baseFrequency: number
  attack: number
  decay: number
  sustain: number
  release: number
  filterFreq: number
  filterQ: number
  reverbMix: number
  thockLevel: number
  clackLevel: number
}

export const SWITCH_ACOUSTIC_PROFILES: Record<string, Partial<AcousticProfile>> = {
  linear: {
    baseFrequency: 800,
    attack: 0.005,
    decay: 0.08,
    thockLevel: 0.7,
    clackLevel: 0.3,
  },
  tactile: {
    baseFrequency: 1200,
    attack: 0.003,
    decay: 0.1,
    thockLevel: 0.5,
    clackLevel: 0.5,
  },
  clicky: {
    baseFrequency: 2500,
    attack: 0.001,
    decay: 0.15,
    thockLevel: 0.2,
    clackLevel: 0.8,
  },
  silent: {
    baseFrequency: 400,
    attack: 0.01,
    decay: 0.05,
    thockLevel: 0.8,
    clackLevel: 0.1,
  },
}

export const LUBE_ACOUSTIC_EFFECTS: Record<string, { freqMod: number; decayMod: number }> = {
  stock: { freqMod: 1.2, decayMod: 1.0 },
  factory: { freqMod: 1.0, decayMod: 0.9 },
  hand_lubed_thin: { freqMod: 0.85, decayMod: 0.8 },
  hand_lubed_thick: { freqMod: 0.7, decayMod: 0.7 },
}

export const PLATE_ACOUSTIC_EFFECTS: Record<string, { brightness: number; resonance: number }> = {
  alu: { brightness: 1.2, resonance: 0.8 },
  brass: { brightness: 1.5, resonance: 1.2 },
  pc: { brightness: 0.8, resonance: 0.6 },
  fr4: { brightness: 1.0, resonance: 1.0 },
  pom: { brightness: 0.7, resonance: 0.5 },
  carbon: { brightness: 1.3, resonance: 0.9 },
  ppe: { brightness: 0.9, resonance: 0.7 },
}

export const CASE_ACOUSTIC_EFFECTS: Record<string, { hollow: number; dampening: number }> = {
  alu_6063: { hollow: 0.6, dampening: 0.4 },
  alu_7075: { hollow: 0.5, dampening: 0.5 },
  pc: { hollow: 0.3, dampening: 0.7 },
  acrylic: { hollow: 0.4, dampening: 0.6 },
  abs: { hollow: 0.7, dampening: 0.3 },
  wood: { hollow: 0.2, dampening: 0.8 },
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function resolveZoneByKeyId(keyId?: string): KeycapZone {
  if (!keyId) {
    return 'alpha'
  }

  const normalized = keyId.toLowerCase()

  if (normalized.startsWith('num')) {
    return 'numpad'
  }

  if (normalized === 'space' || normalized.startsWith('space-')) {
    return 'space'
  }

  if (/^f\d+$/.test(normalized)) {
    return 'function'
  }

  if (
    normalized === 'up' ||
    normalized === 'down' ||
    normalized === 'left' ||
    normalized === 'right' ||
    normalized === 'home' ||
    normalized === 'end' ||
    normalized === 'ins' ||
    normalized === 'del' ||
    normalized === 'pgup' ||
    normalized === 'pgdn'
  ) {
    return 'nav'
  }

  if (
    normalized.includes('shift') ||
    normalized.includes('ctrl') ||
    normalized.includes('alt') ||
    normalized === 'tab' ||
    normalized === 'caps' ||
    normalized === 'fn' ||
    normalized === 'menu'
  ) {
    return 'modifier'
  }

  return 'alpha'
}

class AudioEngine {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private dryGain: GainNode | null = null
  private wetGain: GainNode | null = null
  private reverbNode: ConvolverNode | null = null
  private filterNode: BiquadFilterNode | null = null
  private initialized = false

  /**
   * Bootstraps shared audio nodes. Safe to call multiple times.
   */
  async init() {
    if (this.initialized) {
      return
    }

    this.audioContext = new AudioContext()
    this.masterGain = this.audioContext.createGain()
    this.masterGain.gain.value = 0.5

    this.filterNode = this.audioContext.createBiquadFilter()
    this.filterNode.type = 'lowpass'
    this.filterNode.frequency.value = 5000
    this.filterNode.Q.value = 1

    this.reverbNode = this.audioContext.createConvolver()
    this.dryGain = this.audioContext.createGain()
    this.wetGain = this.audioContext.createGain()

    await this.createReverbImpulse()

    this.filterNode.connect(this.dryGain)
    this.filterNode.connect(this.reverbNode)
    this.reverbNode.connect(this.wetGain)

    this.dryGain.connect(this.masterGain)
    this.wetGain.connect(this.masterGain)
    this.masterGain.connect(this.audioContext.destination)

    this.initialized = true
  }

  private async createReverbImpulse() {
    if (!this.audioContext || !this.reverbNode) {
      return
    }

    const sampleRate = this.audioContext.sampleRate
    const length = sampleRate * 0.5
    const impulse = this.audioContext.createBuffer(2, length, sampleRate)

    for (let channel = 0; channel < 2; channel += 1) {
      const channelData = impulse.getChannelData(channel)
      for (let i = 0; i < length; i += 1) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2)
      }
    }

    this.reverbNode.buffer = impulse
  }

  /**
   * Maps keyboard parameters to a synthetic acoustic profile.
   */
  calculateAcousticProfile(
    switchConfig: SwitchConfig,
    internals: InternalsConfig,
    caseConfig: CaseConfig,
    keycaps: KeycapConfig,
    overrides: AcousticOverrides,
    keyId?: string
  ): AcousticProfile {
    const baseProfile = SWITCH_ACOUSTIC_PROFILES[switchConfig.type] || SWITCH_ACOUSTIC_PROFILES.linear
    const lubeEffect = LUBE_ACOUSTIC_EFFECTS[switchConfig.lube] || LUBE_ACOUSTIC_EFFECTS.stock
    const plateEffect = PLATE_ACOUSTIC_EFFECTS[internals.plateMaterial] || PLATE_ACOUSTIC_EFFECTS.fr4
    const caseEffect = CASE_ACOUSTIC_EFFECTS[caseConfig.material] || CASE_ACOUSTIC_EFFECTS.alu_6063

    const zone = resolveZoneByKeyId(keyId)
    const baseZone = keycaps.zones[zone] || keycaps.zones.alpha
    const overrideZone = keyId ? keycaps.overrides[keyId] : undefined

    const zoneConfig = {
      ...baseZone,
      ...overrideZone,
      thickness: {
        ...baseZone.thickness,
        ...(overrideZone?.thickness || {}),
      },
    }

    let freqMod = lubeEffect.freqMod
    let decayMod = lubeEffect.decayMod

    if (switchConfig.film !== 'none') {
      freqMod *= 0.9
      decayMod *= 0.85
    }

    if (switchConfig.orings.enabled) {
      freqMod *= switchConfig.orings.thickness === 'thick' ? 0.82 : 0.9
      decayMod *= switchConfig.orings.thickness === 'thick' ? 0.62 : 0.75
    }

    const foamDampening = Object.values(internals.foams).filter(Boolean).length * 0.1
    decayMod *= 1 - foamDampening

    if (internals.foams.spacebarFoam && keyId && keyId.includes('space')) {
      decayMod *= 0.72
      freqMod *= 0.86
    }

    const tapeModEffect = 1 - internals.mods.tapeMod * 0.05
    freqMod *= tapeModEffect

    const thicknessAvg = (zoneConfig.thickness.topMm + zoneConfig.thickness.sideMm) / 2
    const thicknessTone = clamp(1.4 - thicknessAvg * 0.26, 0.82, 1.15)
    const hollowTone = clamp(zoneConfig.hollowFactor, 0.5, 1.5)

    const baseFreq =
      (baseProfile.baseFrequency || 800) *
      freqMod *
      plateEffect.brightness *
      thicknessTone *
      (1 + (hollowTone - 1) * 0.22) *
      overrides.brightness

    return {
      baseFrequency: baseFreq,
      attack: baseProfile.attack || 0.005,
      decay: clamp((baseProfile.decay || 0.08) * decayMod * (2 - overrides.dampening), 0.02, 0.5),
      sustain: 0.3,
      release: 0.1,
      filterFreq: clamp(baseFreq * 2 * plateEffect.brightness * overrides.brightness, 400, 12000),
      filterQ: 1 + caseEffect.hollow * hollowTone,
      reverbMix: clamp((0.2 + caseEffect.hollow * 0.3) * overrides.reverb, 0, 1),
      thockLevel: (baseProfile.thockLevel || 0.5) * (1 - caseEffect.dampening * 0.3) * (thicknessAvg > 1.45 ? 1.08 : 0.95),
      clackLevel: (baseProfile.clackLevel || 0.5) * plateEffect.brightness * (thicknessAvg < 1.35 ? 1.08 : 0.92),
    }
  }

  /**
   * Plays a single synthesized key sound.
   */
  playKeySound(profile: AcousticProfile, isDownstroke: boolean = true) {
    if (!this.audioContext || !this.filterNode || !this.dryGain || !this.wetGain) {
      this.init()
        .then(() => this.playKeySound(profile, isDownstroke))
        .catch((error) => {
          console.error('Audio init failed:', error)
        })
      return
    }

    const now = this.audioContext.currentTime

    const osc1 = this.audioContext.createOscillator()
    const osc2 = this.audioContext.createOscillator()

    const osc1Gain = this.audioContext.createGain()
    const osc2Gain = this.audioContext.createGain()
    const envelopeGain = this.audioContext.createGain()

    osc1.type = 'sine'
    osc1.frequency.value = profile.baseFrequency

    osc2.type = isDownstroke ? 'triangle' : 'square'
    osc2.frequency.value = profile.baseFrequency * 1.5

    const thockGain = profile.thockLevel * 0.6
    const clackGain = profile.clackLevel * 0.4

    osc1Gain.gain.value = thockGain
    osc2Gain.gain.value = clackGain

    envelopeGain.gain.setValueAtTime(0.0001, now)
    envelopeGain.gain.linearRampToValueAtTime(thockGain + clackGain, now + profile.attack)
    envelopeGain.gain.exponentialRampToValueAtTime(0.01, now + profile.decay)

    this.filterNode.frequency.setValueAtTime(profile.filterFreq, now)
    this.filterNode.Q.setValueAtTime(profile.filterQ, now)

    this.wetGain.gain.setValueAtTime(Math.max(0, Math.min(1, profile.reverbMix)), now)
    this.dryGain.gain.setValueAtTime(1 - Math.max(0, Math.min(1, profile.reverbMix)), now)

    osc1.connect(osc1Gain)
    osc2.connect(osc2Gain)
    osc1Gain.connect(envelopeGain)
    osc2Gain.connect(envelopeGain)
    envelopeGain.connect(this.filterNode)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + profile.decay + 0.1)
    osc2.stop(now + profile.decay + 0.1)
  }

  setMasterVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume))
    }
  }

  setFilterFrequency(freq: number) {
    if (this.filterNode) {
      this.filterNode.frequency.value = freq
    }
  }
}

export const audioEngine = new AudioEngine()
export default audioEngine
