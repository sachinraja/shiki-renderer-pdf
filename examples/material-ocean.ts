import fs from 'node:fs'
import { PDFDocument } from 'pdf-lib'
import { getHighlighter } from 'shiki'
import { getPdfRenderer, hexToRgb } from '../src'

const renderPdf = async () => {
  const highlighter = await getHighlighter({ theme: 'material-ocean' })

  const pdfRenderer = getPdfRenderer({
    bg: hexToRgb('#000'),
    lineNumbers: {
      bg: hexToRgb('#000'),
      text: hexToRgb('#999'),
    },
  })

  const tokens = highlighter.codeToThemedTokens(
    fs.readFileSync('examples/gen-pdf.ts', 'utf8'),
    'typescript'
  )

  const pdfDoc = await PDFDocument.create()

  await pdfRenderer.renderToPdf(tokens, pdfDoc)

  fs.writeFileSync('examples/material-ocean.pdf', await pdfDoc.save())
}

void renderPdf()
