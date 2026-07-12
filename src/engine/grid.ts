import {
  createPaletteMatcher,
  type PaletteColor,
} from './colorMatcher'

export type BeadCell<
  TColor extends PaletteColor =
    PaletteColor,
> = {
  x: number
  y: number
  color: TColor
}

export function createBeadGrid<
  TColor extends PaletteColor,
>(
  imageData: ImageData,
  palette: readonly TColor[],
): BeadCell<TColor>[] {
  const {
    width,
    height,
    data,
  } = imageData

  const matchColor =
    createPaletteMatcher(palette)

  const grid: BeadCell<TColor>[] =
    new Array(width * height)

  let gridIndex = 0

  for (
    let y = 0;
    y < height;
    y += 1
  ) {
    for (
      let x = 0;
      x < width;
      x += 1
    ) {
      const pixelIndex =
        (y * width + x) * 4

      const alpha =
        data[pixelIndex + 3]

      const red =
        alpha === 0
          ? 255
          : data[pixelIndex]

      const green =
        alpha === 0
          ? 255
          : data[pixelIndex + 1]

      const blue =
        alpha === 0
          ? 255
          : data[pixelIndex + 2]

      grid[gridIndex] = {
        x,
        y,
        color: matchColor(
          red,
          green,
          blue,
        ),
      }

      gridIndex += 1
    }
  }

  return grid
}
