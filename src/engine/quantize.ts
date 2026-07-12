import {
  createPaletteMatcher,
  hexToRgb,
  type PaletteColor,
} from './colorMatcher'

export function quantizeImageData<
  TColor extends PaletteColor,
>(
  source: ImageData,
  palette: readonly TColor[],
): ImageData {
  const output = new ImageData(
    new Uint8ClampedArray(
      source.data.length,
    ),
    source.width,
    source.height,
  )

  const matchColor =
    createPaletteMatcher(palette)

  const rgbCache =
    new Map<string, {
      r: number
      g: number
      b: number
    }>()

  for (
    let index = 0;
    index < source.data.length;
    index += 4
  ) {
    const alpha =
      source.data[index + 3]

    const red =
      alpha === 0
        ? 255
        : source.data[index]

    const green =
      alpha === 0
        ? 255
        : source.data[index + 1]

    const blue =
      alpha === 0
        ? 255
        : source.data[index + 2]

    const nearest =
      matchColor(
        red,
        green,
        blue,
      )

    let nearestRgb =
      rgbCache.get(nearest.hex)

    if (!nearestRgb) {
      nearestRgb =
        hexToRgb(nearest.hex)

      rgbCache.set(
        nearest.hex,
        nearestRgb,
      )
    }

    output.data[index] =
      nearestRgb.r

    output.data[index + 1] =
      nearestRgb.g

    output.data[index + 2] =
      nearestRgb.b

    output.data[index + 3] =
      255
  }

  return output
}
