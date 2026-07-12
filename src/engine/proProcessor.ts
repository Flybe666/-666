import {
  createPaletteMatcher,
  hexToRgb,
  type PaletteColor,
} from './colorMatcher'
import type { BeadCell } from './grid'

export type QuantizationMode = 'nearest' | 'floyd-steinberg'

export type ProProcessingSettings = {
  mode: QuantizationMode
  ditheringStrength: number
  whiteThreshold: number
  cleanupPasses: number
}

export const defaultProProcessingSettings: ProProcessingSettings = {
  mode: 'nearest',
  ditheringStrength: 0.7,
  whiteThreshold: 250,
  cleanupPasses: 1,
}

type Rgb = { r: number; g: number; b: number }

function clamp(value: number) {
  return Math.max(0, Math.min(255, value))
}

function isNearWhite(r: number, g: number, b: number, threshold: number) {
  return r >= threshold && g >= threshold && b >= threshold
}

function findWhiteColor<T extends PaletteColor>(palette: readonly T[]) {
  return (
    palette.find((color) => color.id === 'T1') ??
    palette.reduce((best, color) => {
      const rgb = hexToRgb(color.hex)
      const score = rgb.r + rgb.g + rgb.b
      const bestRgb = hexToRgb(best.hex)
      return score > bestRgb.r + bestRgb.g + bestRgb.b ? color : best
    })
  )
}

function cleanupGrid<T extends PaletteColor>(
  grid: BeadCell<T>[],
  width: number,
  height: number,
  passes: number,
) {
  let current = grid

  for (let pass = 0; pass < passes; pass += 1) {
    const next = current.map((cell) => ({ ...cell }))

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = y * width + x
        const cell = current[index]
        const neighbors: BeadCell<T>[] = []

        if (x > 0) neighbors.push(current[index - 1])
        if (x < width - 1) neighbors.push(current[index + 1])
        if (y > 0) neighbors.push(current[index - width])
        if (y < height - 1) neighbors.push(current[index + width])

        const sameCount = neighbors.filter(
          (neighbor) => neighbor.color.id === cell.color.id,
        ).length

        if (sameCount > 0 || neighbors.length < 3) continue

        const counts = new Map<string, { count: number; color: T }>()
        for (const neighbor of neighbors) {
          const found = counts.get(neighbor.color.id)
          if (found) found.count += 1
          else counts.set(neighbor.color.id, { count: 1, color: neighbor.color })
        }

        const majority = [...counts.values()].sort((a, b) => b.count - a.count)[0]
        if (majority && majority.count >= 2) next[index].color = majority.color
      }
    }

    current = next
  }

  return current
}

export function processImageWithMard<T extends PaletteColor>(
  source: ImageData,
  palette: readonly T[],
  settings: ProProcessingSettings,
) {
  const { width, height } = source
  const matchColor = createPaletteMatcher(palette)
  const whiteColor = findWhiteColor(palette)
  const working = new Float32Array(source.data.length)

  for (let i = 0; i < source.data.length; i += 1) working[i] = source.data[i]

  const grid: BeadCell<T>[] = new Array(width * height)

  function addError(x: number, y: number, error: Rgb, factor: number) {
    if (x < 0 || y < 0 || x >= width || y >= height) return
    const index = (y * width + x) * 4
    working[index] += error.r * factor * settings.ditheringStrength
    working[index + 1] += error.g * factor * settings.ditheringStrength
    working[index + 2] += error.b * factor * settings.ditheringStrength
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = (y * width + x) * 4
      const alpha = source.data[pixelIndex + 3]
      const r = alpha === 0 ? 255 : clamp(working[pixelIndex])
      const g = alpha === 0 ? 255 : clamp(working[pixelIndex + 1])
      const b = alpha === 0 ? 255 : clamp(working[pixelIndex + 2])

      const color = isNearWhite(r, g, b, settings.whiteThreshold)
        ? whiteColor
        : matchColor(r, g, b)

      grid[y * width + x] = { x, y, color }

      if (settings.mode === 'floyd-steinberg') {
        const mapped = hexToRgb(color.hex)
        const error = { r: r - mapped.r, g: g - mapped.g, b: b - mapped.b }
        addError(x + 1, y, error, 7 / 16)
        addError(x - 1, y + 1, error, 3 / 16)
        addError(x, y + 1, error, 5 / 16)
        addError(x + 1, y + 1, error, 1 / 16)
      }
    }
  }

  const cleaned = cleanupGrid(
    grid,
    width,
    height,
    Math.max(0, Math.floor(settings.cleanupPasses)),
  )

  const output = new ImageData(width, height)
  const rgbCache = new Map<string, Rgb>()

  for (let i = 0; i < cleaned.length; i += 1) {
    const color = cleaned[i].color
    let rgb = rgbCache.get(color.hex)
    if (!rgb) {
      rgb = hexToRgb(color.hex)
      rgbCache.set(color.hex, rgb)
    }
    const index = i * 4
    output.data[index] = rgb.r
    output.data[index + 1] = rgb.g
    output.data[index + 2] = rgb.b
    output.data[index + 3] = 255
  }

  return { grid: cleaned, imageData: output }
}
