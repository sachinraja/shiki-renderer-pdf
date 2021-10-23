import { Color, PDFDocument, PDFPage } from 'pdf-lib'
import { LineNumberTransformations, RenderToPdfOptions } from './types'

export const createPage = (pdfDoc: PDFDocument, bg: Color) => {
  const page = pdfDoc.addPage()
  const pageDimensions = page.getSize()

  // Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageDimensions.width,
    height: pageDimensions.height,
    color: bg,
  })

  return { page, pageDimensions }
}

export const finishPage = (
  page: PDFPage,
  startingLineX: number,
  lineNumberTransformations: LineNumberTransformations,
  lineNumberColors: RenderToPdfOptions['lineNumbers']
) => {
  const lineX = startingLineX - 5

  // Line number separation line
  page.drawLine({
    start: { x: lineX, y: 0 },
    end: { x: lineX, y: page.getHeight() },
    color: lineNumberColors.text,
    thickness: 2,
  })

  // Background for line numbers
  page.drawRectangle({
    x: 0,
    y: 0,
    width: lineX,
    height: page.getHeight(),
    color: lineNumberColors.bg,
  })

  for (const transformation of lineNumberTransformations) {
    transformation(page)
  }
}
