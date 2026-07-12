export type PaletteColor = {
  id: string
  name: string
  hex: string
}

type RgbColor = {
  r: number
  g: number
  b: number
}

type LabColor = {
  l: number
  a: number
  b: number
}

type PreparedColor<T extends PaletteColor> = {
  color: T
  rgb: RgbColor
  lab: LabColor
}

const preparedPaletteCache =
  new WeakMap<
    readonly PaletteColor[],
    PreparedColor<PaletteColor>[]
  >()

function clampByte(value: number) {
  return Math.max(
    0,
    Math.min(255, Math.round(value)),
  )
}

export function hexToRgb(
  hex: string,
): RgbColor {
  const normalized =
    hex.trim().replace('#', '')

  if (
    !/^[0-9A-Fa-f]{6}$/.test(
      normalized,
    )
  ) {
    throw new Error(
      `無效的 HEX 色碼：${hex}`,
    )
  }

  return {
    r: Number.parseInt(
      normalized.slice(0, 2),
      16,
    ),
    g: Number.parseInt(
      normalized.slice(2, 4),
      16,
    ),
    b: Number.parseInt(
      normalized.slice(4, 6),
      16,
    ),
  }
}

function srgbChannelToLinear(
  value: number,
) {
  const channel = value / 255

  return channel <= 0.04045
    ? channel / 12.92
    : Math.pow(
        (channel + 0.055) /
          1.055,
        2.4,
      )
}

function rgbToLab({
  r,
  g,
  b,
}: RgbColor): LabColor {
  const red =
    srgbChannelToLinear(r)
  const green =
    srgbChannelToLinear(g)
  const blue =
    srgbChannelToLinear(b)

  const x =
    (
      red * 0.4124564 +
      green * 0.3575761 +
      blue * 0.1804375
    ) /
    0.95047

  const y =
    (
      red * 0.2126729 +
      green * 0.7151522 +
      blue * 0.072175
    ) /
    1

  const z =
    (
      red * 0.0193339 +
      green * 0.119192 +
      blue * 0.9503041
    ) /
    1.08883

  function pivot(value: number) {
    return value > 0.008856
      ? Math.cbrt(value)
      : 7.787 * value +
          16 / 116
  }

  const fx = pivot(x)
  const fy = pivot(y)
  const fz = pivot(z)

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  }
}

function labDistanceSquared(
  first: LabColor,
  second: LabColor,
) {
  const dl = first.l - second.l
  const da = first.a - second.a
  const db = first.b - second.b

  return (
    dl * dl +
    da * da +
    db * db
  )
}

function preparePalette<
  T extends PaletteColor,
>(
  palette: readonly T[],
): PreparedColor<T>[] {
  if (palette.length === 0) {
    throw new Error(
      '色盤不能是空的。',
    )
  }

  const cached =
    preparedPaletteCache.get(
      palette,
    )

  if (cached) {
    return cached as PreparedColor<T>[]
  }

  const prepared = palette.map(
    (color) => {
      const rgb =
        hexToRgb(color.hex)

      return {
        color,
        rgb,
        lab: rgbToLab(rgb),
      }
    },
  )

  preparedPaletteCache.set(
    palette,
    prepared as PreparedColor<PaletteColor>[],
  )

  return prepared
}

export function findNearestPaletteColor<
  T extends PaletteColor,
>(
  red: number,
  green: number,
  blue: number,
  palette: readonly T[],
): T {
  const prepared =
    preparePalette(palette)

  const targetLab = rgbToLab({
    r: clampByte(red),
    g: clampByte(green),
    b: clampByte(blue),
  })

  let nearest =
    prepared[0]

  let nearestDistance =
    Number.POSITIVE_INFINITY

  for (const candidate of prepared) {
    const distance =
      labDistanceSquared(
        targetLab,
        candidate.lab,
      )

    if (
      distance <
      nearestDistance
    ) {
      nearest = candidate
      nearestDistance = distance
    }
  }

  return nearest.color
}

export function createPaletteMatcher<
  T extends PaletteColor,
>(
  palette: readonly T[],
) {
  const prepared =
    preparePalette(palette)

  return (
    red: number,
    green: number,
    blue: number,
  ): T => {
    const targetLab = rgbToLab({
      r: clampByte(red),
      g: clampByte(green),
      b: clampByte(blue),
    })

    let nearest =
      prepared[0]

    let nearestDistance =
      Number.POSITIVE_INFINITY

    for (
      const candidate
      of prepared
    ) {
      const distance =
        labDistanceSquared(
          targetLab,
          candidate.lab,
        )

      if (
        distance <
        nearestDistance
      ) {
        nearest = candidate
        nearestDistance =
          distance
      }
    }

    return nearest.color
  }
}
