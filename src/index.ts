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

export const renderToPdf = async (
  lines: IThemedToken[][],
  pdfDocument: PDFDocument,
  { defaultColor, bg, lineNumbers, fontMap, fontSize }: RenderToPdfOptions
) => {
  let normalizedLines = lines

  // If only one token exists
  // it might be plaintext and should be split by newlines
  if (lines.length === 1 && lines[0].length === 1) {
    const newLines: IThemedToken[][] = []
    const token = lines[0][0]

    for (const line of token.content.split('\n')) {
      newLines.push([{ ...token, content: line }])
    }

    normalizedLines = newLines
  }

  let { page, pageDimensions } = createPage(pdfDocument, bg)

  const regularFont = fontMap.regular

  const oneCharacterWidth = regularFont.widthOfTextAtSize('a', fontSize)
  const largestLineNumberStringWidth = regularFont.widthOfTextAtSize(
    normalizedLines.length.toString(),
    fontSize
  )

  const startingLineX =
    largestLineNumberStringWidth + Math.max(oneCharacterWidth, 15)

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

  for (const [i, line] of normalizedLines.entries()) {
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
          Math.max(oneCharacterWidth, 10),
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

      const rgbColor = token.color ? hexToRgb(token.color) : defaultColor
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
  const defaultColor = options.defaultColor ?? rgb(0, 0, 0)
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
        defaultColor,
        bg,
        fontMap: embedFontMap,
        fontSize,
        lineNumbers,
      })
    },
  }
}

export { hexToRgb }
