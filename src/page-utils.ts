import { PDFDocument, PDFPage, rgb } from 'pdf-lib'
import { LineNumberTransformations } from './types'
import { hexToRgb } from './utils'

export const createPage = (pdfDoc: PDFDocument) => {
  const page = pdfDoc.addPage()
  const pageDimensions = page.getSize()

  return { page, pageDimensions }
}

export const finishPage = (
  page: PDFPage,
  startingLineX: number,
  lineNumberTransformations: LineNumberTransformations
) => {
  const lineX = startingLineX - 5

  page.drawLine({
    start: { x: lineX, y: 0 },
    end: { x: lineX, y: page.getHeight() },
    color: rgb(...hexToRgb('#999')),
    thickness: 2,
  })

  page.drawRectangle({
    x: 0,
    y: 0,
    width: lineX,
    height: page.getHeight(),
    color: rgb(...hexToRgb('#f7f7f7')),
  })

  for (const transformation of lineNumberTransformations) {
    transformation(page)
  }
}
