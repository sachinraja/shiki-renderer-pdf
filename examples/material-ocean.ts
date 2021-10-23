import fs from 'node:fs'
import { getHighlighter } from 'shiki'
import { PDFDocument } from 'pdf-lib'
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
    'ts'
  )

  const pdfDocument = await PDFDocument.create()

  await pdfRenderer.renderToPdf(tokens, pdfDocument)

  fs.writeFileSync(
    'examples/material-ocean.pdf',
    await pdfDocument.save(),
    'binary'
  )
}

void renderPdf()
