import { IThemedToken } from 'shiki'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import hexRgb from 'hex-rgb'

const defaultColor = '#000000'

export const renderToPdf = async (lines: IThemedToken[][]) => {
  const pdfDoc = await PDFDocument.create()

  const font = await pdfDoc.embedFont(StandardFonts.Courier)

  const page = pdfDoc.addPage()
  const { width: pageWidth, height: pageHeight } = page.getSize()

  const fontSize = 15

  let lineY = pageHeight

  for (const line of lines) {
    lineY -= fontSize

    const tokenText: string[] = []

    let lineX = 0

    for (const token of line) {
      tokenText.push(token.content)

      const rgbColor = hexRgb(token.color ?? defaultColor, {
        format: 'array',
      })

      const decimalRgbColor = rgbColor.map((rgbNumber) => rgbNumber / 255) as [
        number,
        number,
        number
      ]

      const newLineX = lineX + font.widthOfTextAtSize(token.content, fontSize)

      if (newLineX > pageWidth) {
        lineX = 0
        lineY -= fontSize
      }

      page.drawText(token.content, {
        x: lineX,
        y: lineY,
        size: fontSize,
        color: rgb(...decimalRgbColor),
        font,
      })

      lineX += font.widthOfTextAtSize(token.content, fontSize)
    }
  }

  return pdfDoc
}
