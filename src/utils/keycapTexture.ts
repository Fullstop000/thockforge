import * as THREE from 'three'

export type KeyTone = 'default' | 'modifier' | 'accent' | 'dark'

const TEXTURE_SIZE = 256
const textureCache = new Map<string, THREE.CanvasTexture>()

function drawNoise(ctx: CanvasRenderingContext2D, intensity: number) {
  const imageData = ctx.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.floor((Math.random() - 0.5) * intensity)
    data[i] = Math.max(0, Math.min(255, data[i] + noise))
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
  }

  ctx.putImageData(imageData, 0, 0)
}

function drawDefaultTheme(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#fbfcff'
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)
  drawNoise(ctx, 8)

  ctx.strokeStyle = 'rgba(90, 100, 122, 0.08)'
  ctx.lineWidth = 1
  for (let i = 0; i < 8; i += 1) {
    ctx.beginPath()
    ctx.moveTo(0, i * 32 + 8)
    ctx.lineTo(TEXTURE_SIZE, i * 32 + 18)
    ctx.stroke()
  }
}

function drawCarbonTheme(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#3a4150'
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)

  ctx.strokeStyle = 'rgba(200, 210, 230, 0.11)'
  ctx.lineWidth = 1.2
  for (let i = -TEXTURE_SIZE; i < TEXTURE_SIZE * 2; i += 12) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i - 56, TEXTURE_SIZE)
    ctx.stroke()
  }

  ctx.strokeStyle = 'rgba(30, 34, 44, 0.3)'
  for (let i = -TEXTURE_SIZE; i < TEXTURE_SIZE * 2; i += 12) {
    ctx.beginPath()
    ctx.moveTo(i - 8, 0)
    ctx.lineTo(i - 64, TEXTURE_SIZE)
    ctx.stroke()
  }
}

function drawPastelTheme(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#fff6fb'
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)

  const gradient = ctx.createRadialGradient(96, 90, 12, 96, 90, 110)
  gradient.addColorStop(0, 'rgba(255, 206, 234, 0.4)')
  gradient.addColorStop(1, 'rgba(255, 206, 234, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)

  for (let i = 0; i < 18; i += 1) {
    const x = Math.random() * TEXTURE_SIZE
    const y = Math.random() * TEXTURE_SIZE
    const radius = 2 + Math.random() * 4
    ctx.beginPath()
    ctx.fillStyle = `rgba(255, 180, 220, ${0.07 + Math.random() * 0.1})`
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawCyberpunkTheme(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#1d2438'
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)

  for (let y = 0; y < TEXTURE_SIZE; y += 6) {
    ctx.fillStyle = y % 12 === 0 ? 'rgba(60, 230, 255, 0.14)' : 'rgba(255, 70, 170, 0.08)'
    ctx.fillRect(0, y, TEXTURE_SIZE, 1)
  }

  for (let i = 0; i < 24; i += 1) {
    const x = Math.random() * TEXTURE_SIZE
    const y = Math.random() * TEXTURE_SIZE
    const w = 8 + Math.random() * 22
    const h = 1 + Math.random() * 2
    ctx.fillStyle = i % 2 === 0 ? 'rgba(90, 240, 255, 0.14)' : 'rgba(255, 116, 209, 0.12)'
    ctx.fillRect(x, y, w, h)
  }
}

function drawOceanTheme(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#edf8ff'
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)

  ctx.strokeStyle = 'rgba(76, 182, 228, 0.18)'
  ctx.lineWidth = 1.3

  for (let y = 12; y < TEXTURE_SIZE + 12; y += 16) {
    ctx.beginPath()
    for (let x = 0; x <= TEXTURE_SIZE; x += 6) {
      const wave = Math.sin((x / TEXTURE_SIZE) * Math.PI * 4 + y * 0.08) * 2.5
      if (x === 0) {
        ctx.moveTo(x, y + wave)
      } else {
        ctx.lineTo(x, y + wave)
      }
    }
    ctx.stroke()
  }
}

function applyToneOverlay(ctx: CanvasRenderingContext2D, tone: KeyTone) {
  if (tone === 'default') {
    return
  }

  if (tone === 'modifier') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.06)'
  } else if (tone === 'accent') {
    ctx.fillStyle = 'rgba(70, 220, 255, 0.08)'
  } else {
    ctx.fillStyle = 'rgba(8, 10, 20, 0.22)'
  }

  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)
}

/**
 * Returns a cached procedural keycap texture per theme/tone pair.
 */
export function getKeycapTexture(theme: string, tone: KeyTone): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') {
    return null
  }

  const cacheKey = `${theme}:${tone}`
  const cached = textureCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const canvas = document.createElement('canvas')
  canvas.width = TEXTURE_SIZE
  canvas.height = TEXTURE_SIZE
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  if (theme === 'carbon') {
    drawCarbonTheme(ctx)
  } else if (theme === 'pastel') {
    drawPastelTheme(ctx)
  } else if (theme === 'cyberpunk') {
    drawCyberpunkTheme(ctx)
  } else if (theme === 'ocean') {
    drawOceanTheme(ctx)
  } else {
    drawDefaultTheme(ctx)
  }

  applyToneOverlay(ctx, tone)
  drawNoise(ctx, 5)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  texture.anisotropy = 8
  texture.needsUpdate = true

  textureCache.set(cacheKey, texture)
  return texture
}
