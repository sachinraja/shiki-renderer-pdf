import fs from 'node:fs'
import { PDFDocument } from 'pdf-lib'
import { getHighlighter } from 'shiki'
import { getPdfRenderer, hexToRgb } from './src'

const a = async () => {
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
    'ts'
  )

  const pdfDoc = await PDFDocument.create()

  await pdfRenderer.renderToPdf(tokens, pdfDoc)

  fs.writeFileSync('example.pdf', await pdfDoc.save())
}

void a()
