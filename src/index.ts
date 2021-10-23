import { FontStyle, IThemedToken } from 'shiki'
import {
  PDFDocument,
  PDFFont,
  PDFPageDrawTextOptions,
  rgb,
  StandardFonts,
} from 'pdf-lib'
import {
  LineNumberTransformations,
  PdfRendererOptions,
  RenderToPdfOptions,
} from './types'
import { createPage, finishPage } from './page-utils'
import { chunkString, hexToRgb } from './utils'

const defaultColor = '#000000'

export const renderToPdf = async (
  lines: IThemedToken[][],
  pdfDocument: PDFDocument,
  { fontMap, fontSize, bg, lineNumbers }: RenderToPdfOptions
) => {
  let { page, pageDimensions } = createPage(pdfDocument, bg)

  const regularFont = fontMap.regular

  const oneCharacterWidth = regularFont.widthOfTextAtSize('a', fontSize)
  const largestLineNumberStringWidth = regularFont.widthOfTextAtSize(
    lines.length.toString(),
    fontSize
  )

  const startingLineX = largestLineNumberStringWidth + 10
  const codePageWidth = pageDimensions.width - startingLineX
  const maxCharactersPerLine = Math.floor(codePageWidth / oneCharacterWidth)

  let lineY = pageDimensions.height

  let lineNumberTransformations: LineNumberTransformations = []

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const subtractLineYByFontSize = () => {
    lineY -= fontSize
    if (lineY < 0) {
      finishPage(page, startingLineX, lineNumberTransformations, lineNumbers)
      lineNumberTransformations = []
      ;({ page, pageDimensions } = createPage(pdfDocument, bg))
      lineY = pageDimensions.height - fontSize
    }
  }

  for (const [i, line] of lines.entries()) {
    subtractLineYByFontSize()

    const tokenText: string[] = []
    let lineX = startingLineX
    const lineNumberString = (i + 1).toString()

    const currentLineY = lineY
    lineNumberTransformations.push((currentPage) => {
      currentPage.drawText(lineNumberString, {
        x:
          startingLineX -
          regularFont.widthOfTextAtSize(lineNumberString, fontSize) -
          5,
        y: currentLineY,
        size: fontSize,
        color: lineNumbers.text,
      })
    })

    for (const token of line) {
      tokenText.push(token.content)

      let tokenFont = fontMap.regular

      if (token.fontStyle === FontStyle.Bold) {
        tokenFont = fontMap.bold
      } else if (token.fontStyle === FontStyle.Italic) {
        tokenFont = fontMap.italic
      }

      const rgbColor = hexToRgb(token.color ?? defaultColor)
      const tokenWidth = regularFont.widthOfTextAtSize(token.content, fontSize)

      const drawOptions: PDFPageDrawTextOptions = {
        size: fontSize,
        color: rgbColor,
        font: tokenFont,
      }

      if (tokenWidth > codePageWidth) {
        // Account for different lineX
        const firstChunkSize = Math.floor(
          (pageDimensions.width - lineX) / oneCharacterWidth
        )
        const firstChunk = token.content.slice(0, firstChunkSize)

        const restofTokenContent = token.content.slice(firstChunkSize)

        const otherChunks = chunkString(
          restofTokenContent,
          maxCharactersPerLine
        )

        page.drawText(firstChunk, {
          x: lineX,
          y: lineY,
          ...drawOptions,
        })

        subtractLineYByFontSize()
        lineX = startingLineX

        for (const [i, chunk] of otherChunks.entries()) {
          page.drawText(chunk, {
            x: lineX,
            y: lineY,
            ...drawOptions,
          })

          if (i !== otherChunks.length - 1) {
            subtractLineYByFontSize()
            lineX = startingLineX
          }
        }

        lineX += tokenFont.widthOfTextAtSize(
          otherChunks[otherChunks.length - 1],
          fontSize
        )
      } else {
        const potentialNewLineX = lineX + tokenWidth

        if (potentialNewLineX > pageDimensions.width) {
          lineX = startingLineX
          subtractLineYByFontSize()
        }

        page.drawText(token.content, {
          x: lineX,
          y: lineY,
          ...drawOptions,
        })

        lineX += tokenWidth
      }
    }
  }

  finishPage(page, startingLineX, lineNumberTransformations, lineNumbers)

  return pdfDocument
}

export const getPdfRenderer = (options: PdfRendererOptions = {}) => {
  const bg = options.bg ?? rgb(1, 1, 1)

  const fontMap = options.fontMap ?? {
    regular: StandardFonts.Courier,
    italic: StandardFonts.CourierOblique,
    bold: StandardFonts.CourierBold,
  }

  const fontSize = options.fontSize ?? 12

  const decimal247 = 247 / 255
  const decimal153 = 153 / 255

  const lineNumbers = options.lineNumbers ?? {
    bg: rgb(decimal247, decimal247, decimal247),
    text: rgb(decimal153, decimal153, decimal153),
  }

  return {
    renderToPdf: async (lines: IThemedToken[][], pdfDocument: PDFDocument) => {
      const embedFontMap: Record<string, PDFFont> = {}

      await Promise.all(
        Object.entries(fontMap).map(async ([variation, font]) => {
          const embedFont = await pdfDocument.embedFont(font)
          embedFontMap[variation] = embedFont
        })
      )

      return renderToPdf(lines, pdfDocument, {
        bg,
        fontMap: embedFontMap,
        fontSize,
        lineNumbers,
      })
    },
  }
}

export { hexToRgb }
