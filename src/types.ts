import { Color, PDFDocument, PDFFont, PDFPage } from 'pdf-lib'

export type LineNumberTransformations = Array<(currentPage: PDFPage) => void>

type FontVariations = 'regular' | 'bold' | 'italic'

export type CommonOptions = {
  defaultColor: Color
  bg: Color
  fontSize: number
  lineNumbers: {
    bg: Color
    text: Color
  }
}

export type PdfRendererOptions = Partial<CommonOptions> & {
  fontMap?: Record<FontVariations, Parameters<PDFDocument['embedFont']>[0]>
}

export type RenderToPdfOptions = CommonOptions & {
  fontMap: Record<FontVariations, PDFFont>
}
