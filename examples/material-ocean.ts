import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
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
    fs.readFileSync('src/index.ts', 'utf8'),
    'js'
  )

  const pdfDoc = await PDFDocument.create()

  await pdfRenderer.renderToPdf(tokens, pdfDoc)

  fs.writeFileSync(
    path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      'material-ocean.pdf'
    ),
    await pdfDoc.save()
  )
}

void renderPdf()
