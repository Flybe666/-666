import type { BeadColor } from '../data/mard221'

export interface RGBColor {
  r: number
  g: number
  b: number
}

function colorDistance(a: RGBColor, b: RGBColor): number {
  const redDifference = a.r - b.r
  const greenDifference = a.g - b.g
  const blueDifference = a.b - b.b

  return (
    redDifference * redDifference +
    greenDifference * greenDifference +
    blueDifference * blueDifference
  )
}

export function findNearestColor(
  source: RGBColor,
  palette: BeadColor[],
): BeadColor {
  if (palette.length === 0) {
    throw new Error('色盤不可為空')
  }

  let nearestColor = palette[0]
  let nearestDistance = colorDistance(source, palette[0])

  for (let index = 1; index < palette.length; index += 1) {
    const candidate = palette[index]
    const distance = colorDistance(source, candidate)

    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestColor = candidate
    }
  }

  return nearestColor
}

export function quantizeImageData(
  imageData: ImageData,
  palette: BeadColor[],
): ImageData {
  const output = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height,
  )

  for (let index = 0; index < output.data.length; index += 4) {
    const alpha = output.data[index + 3]

    if (alpha === 0) {
      continue
    }

    const nearest = findNearestColor(
      {
        r: output.data[index],
        g: output.data[index + 1],
        b: output.data[index + 2],
      },
      palette,
    )

    output.data[index] = nearest.r
    output.data[index + 1] = nearest.g
    output.data[index + 2] = nearest.b
  }

  return output
}
