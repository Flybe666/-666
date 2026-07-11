import type { BeadColor } from '../data/mard221'
import { findNearestColor } from './quantize'

export interface BeadCell {
  x: number
  y: number
  color: BeadColor
}

export function createBeadGrid(
  imageData: ImageData,
  palette: BeadColor[],
): BeadCell[] {
  const cells: BeadCell[] = []

  for (let y = 0; y < imageData.height; y += 1) {
    for (let x = 0; x < imageData.width; x += 1) {
      const index = (y * imageData.width + x) * 4
      const alpha = imageData.data[index + 3]

      if (alpha === 0) {
        continue
      }

      const color = findNearestColor(
        {
          r: imageData.data[index],
          g: imageData.data[index + 1],
          b: imageData.data[index + 2],
        },
        palette,
      )

      cells.push({
        x,
        y,
        color,
      })
    }
  }

  return cells
}
