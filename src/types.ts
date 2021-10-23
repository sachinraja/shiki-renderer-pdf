import { PDFPage } from 'pdf-lib'

export type LineNumberTransformations = Array<(currentPage: PDFPage) => void>
