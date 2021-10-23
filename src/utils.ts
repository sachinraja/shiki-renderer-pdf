import hexRgb from 'hex-rgb'
import { rgb } from 'pdf-lib'

export const chunkString = (string: string, size: number) => {
  const chunksCount = Math.ceil(string.length / size)
  const chunks: string[] = []

  let stringPosition = size

  for (let i = 0, o = 0; i < chunksCount; ++i, o += size) {
    chunks[i] = string.slice(o, stringPosition)
    stringPosition += size
  }

  return chunks
}

export const hexToRgb = (hex: string) => {
  const rgbColor = hexRgb(hex, {
    format: 'array',
  })

  const decimalRgbColor = rgbColor.map((rgbNumber) => rgbNumber / 255) as [
    number,
    number,
    number
  ]

  return rgb(...decimalRgbColor)
}
