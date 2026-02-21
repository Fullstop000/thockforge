import * as THREE from 'three'
import { clamp } from '@/components/3d/materials/pbrPresets'

/**
 * 键帽顶面曲面缓存键。
 */
interface TopSurfaceCacheKey {
  width: number
  depth: number
  dishDepth: number
  rowSculptBias: number
  segmentsX: number
  segmentsZ: number
}

/**
 * 键帽裙边缓存键。
 */
interface SkirtSurfaceCacheKey {
  bottomWidth: number
  bottomDepth: number
  topWidth: number
  topDepth: number
  height: number
  belly: number
  crownLift: number
  radialSegments: number
  heightSegments: number
}

/**
 * 缓存顶面曲面几何，避免同参数重复构建。
 */
const topSurfaceCache = new Map<string, THREE.BufferGeometry>()
const skirtSurfaceCache = new Map<string, THREE.BufferGeometry>()

function serializeKey(key: TopSurfaceCacheKey): string {
  return [
    key.width.toFixed(5),
    key.depth.toFixed(5),
    key.dishDepth.toFixed(5),
    key.rowSculptBias.toFixed(4),
    key.segmentsX,
    key.segmentsZ,
  ].join('|')
}

function serializeSkirtKey(key: SkirtSurfaceCacheKey): string {
  return [
    key.bottomWidth.toFixed(5),
    key.bottomDepth.toFixed(5),
    key.topWidth.toFixed(5),
    key.topDepth.toFixed(5),
    key.height.toFixed(5),
    key.belly.toFixed(5),
    key.crownLift.toFixed(5),
    key.radialSegments,
    key.heightSegments,
  ].join('|')
}

function superellipsePoint(angle: number, radiusX: number, radiusZ: number, exponent: number): [number, number] {
  const cosValue = Math.cos(angle)
  const sinValue = Math.sin(angle)
  const pow = 2 / exponent

  const x = Math.sign(cosValue) * Math.pow(Math.abs(cosValue), pow) * radiusX
  const z = Math.sign(sinValue) * Math.pow(Math.abs(sinValue), pow) * radiusZ
  return [x, z]
}

/**
 * 生成连续凹碟顶面。
 * 约束：
 * 1. 只使用单一曲面表达顶面，不叠加 ring 辅助几何。
 * 2. 边缘抬升与中心下凹连续过渡，避免高光断裂。
 */
export function createTopSurfaceGeometry(options: {
  width: number
  depth: number
  dishDepth: number
  rowSculptBias: number
  segmentsX?: number
  segmentsZ?: number
}): THREE.BufferGeometry {
  const segmentsX = options.segmentsX ?? 20
  const segmentsZ = options.segmentsZ ?? 14

  const key: TopSurfaceCacheKey = {
    width: options.width,
    depth: options.depth,
    dishDepth: options.dishDepth,
    rowSculptBias: options.rowSculptBias,
    segmentsX,
    segmentsZ,
  }

  const cacheKey = serializeKey(key)
  const cached = topSurfaceCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const vertexCount = (segmentsX + 1) * (segmentsZ + 1)
  const positions = new Float32Array(vertexCount * 3)
  const indices: number[] = []

  let offset = 0
  for (let zIndex = 0; zIndex <= segmentsZ; zIndex += 1) {
    const v = zIndex / segmentsZ
    const zNorm = v * 2 - 1
    const z = zNorm * options.depth * 0.5

    for (let xIndex = 0; xIndex <= segmentsX; xIndex += 1) {
      const u = xIndex / segmentsX
      const xNorm = u * 2 - 1
      const x = xNorm * options.width * 0.5

      const radius = clamp(Math.sqrt(xNorm * xNorm + zNorm * zNorm), 0, 1)

      // 让边缘过渡更平缓，避免出现环形高光断层。
      const centerCurve = 1 - Math.pow(radius, 1.85)
      const bowlDepth = -options.dishDepth * centerCurve

      // 行雕只在中心区域更明显，靠边自动收敛。
      const sculptAttenuation = 1 - Math.pow(radius, 2.2)
      const sculptDepth = options.rowSculptBias * zNorm * 0.00042 * sculptAttenuation

      // 轻微肩部抬升，模拟真实键帽顶部边缘的过渡。
      const shoulderLift = options.dishDepth * Math.pow(radius, 2.6) * 0.08

      positions[offset] = x
      positions[offset + 1] = bowlDepth + sculptDepth + shoulderLift
      positions[offset + 2] = z
      offset += 3
    }
  }

  for (let zIndex = 0; zIndex < segmentsZ; zIndex += 1) {
    for (let xIndex = 0; xIndex < segmentsX; xIndex += 1) {
      const a = zIndex * (segmentsX + 1) + xIndex
      const b = a + 1
      const c = a + (segmentsX + 1)
      const d = c + 1

      indices.push(a, c, b)
      indices.push(b, c, d)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()

  topSurfaceCache.set(cacheKey, geometry)
  return geometry
}

/**
 * 生成键帽外裙边几何（不包含顶部凹碟）。
 * 通过 superellipse 分层插值构造连续侧壁，避免 RoundedBox 的体块感。
 */
export function createKeycapSkirtGeometry(options: {
  bottomWidth: number
  bottomDepth: number
  topWidth: number
  topDepth: number
  height: number
  belly: number
  crownLift: number
  radialSegments?: number
  heightSegments?: number
}): THREE.BufferGeometry {
  const radialSegments = options.radialSegments ?? 40
  const heightSegments = options.heightSegments ?? 10

  const key: SkirtSurfaceCacheKey = {
    bottomWidth: options.bottomWidth,
    bottomDepth: options.bottomDepth,
    topWidth: options.topWidth,
    topDepth: options.topDepth,
    height: options.height,
    belly: options.belly,
    crownLift: options.crownLift,
    radialSegments,
    heightSegments,
  }

  const cacheKey = serializeSkirtKey(key)
  const cached = skirtSurfaceCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const ringSize = Math.max(20, radialSegments)
  const vertexCount = (heightSegments + 1) * ringSize
  const positions = new Float32Array(vertexCount * 3)
  const indices: number[] = []

  let offset = 0
  for (let yIndex = 0; yIndex <= heightSegments; yIndex += 1) {
    const t = yIndex / heightSegments
    const smooth = t * t * (3 - 2 * t)

    const widthBase = THREE.MathUtils.lerp(options.bottomWidth, options.topWidth, smooth)
    const depthBase = THREE.MathUtils.lerp(options.bottomDepth, options.topDepth, smooth)
    const bellyGain = options.belly * Math.sin(Math.PI * Math.min(1, t * 1.06)) * Math.pow(1 - t, 0.38)

    const localWidth = widthBase + bellyGain
    const localDepth = depthBase + bellyGain * 0.92
    const yBase = -options.height * 0.5 + options.height * t
    const y = yBase + options.crownLift * Math.pow(t, 2.3)

    // 底部更方正，顶部更圆润，接近真实键帽裙边变化趋势。
    const exponent = THREE.MathUtils.lerp(4.6, 3.2, smooth)

    for (let radialIndex = 0; radialIndex < ringSize; radialIndex += 1) {
      const angle = (radialIndex / ringSize) * Math.PI * 2
      const [x, z] = superellipsePoint(angle, localWidth * 0.5, localDepth * 0.5, exponent)

      positions[offset] = x
      positions[offset + 1] = y
      positions[offset + 2] = z
      offset += 3
    }
  }

  for (let yIndex = 0; yIndex < heightSegments; yIndex += 1) {
    for (let radialIndex = 0; radialIndex < ringSize; radialIndex += 1) {
      const nextIndex = (radialIndex + 1) % ringSize

      const a = yIndex * ringSize + radialIndex
      const b = yIndex * ringSize + nextIndex
      const c = (yIndex + 1) * ringSize + radialIndex
      const d = (yIndex + 1) * ringSize + nextIndex

      indices.push(a, c, b)
      indices.push(b, c, d)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()

  skirtSurfaceCache.set(cacheKey, geometry)
  return geometry
}

/**
 * 释放曲面缓存。
 * 在热更新或极端参数切换测试时可用于手动回收。
 */
export function clearTopSurfaceGeometryCache() {
  topSurfaceCache.forEach((geometry) => {
    geometry.dispose()
  })
  topSurfaceCache.clear()

  skirtSurfaceCache.forEach((geometry) => {
    geometry.dispose()
  })
  skirtSurfaceCache.clear()
}
