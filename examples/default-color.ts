import fs from 'node:fs'
import shiki from 'shiki'
import { PDFDocument } from 'pdf-lib'
import { getPdfRenderer, hexToRgb } from '../src'

// eslint-disable-next-line import/newline-after-import
;(async () => {
  // eslint-disable-next-line import/no-named-as-default-member
  const highlighter = await shiki.getHighlighter({
    theme: 'nord',
  })

  const pdfRenderer = getPdfRenderer({
    defaultColor: hexToRgb('#f8f8f2'),
    bg: hexToRgb('#2E3440'),
    lineNumbers: {
      bg: hexToRgb('#151B27'),
      text: hexToRgb('#fff'),
    },
    fontSize: 12,
  })

  const code = fs.readFileSync('examples/gen-pdf.ts', 'utf-8')

  // No lang specified - render plaintext
  const tokens = highlighter.codeToThemedTokens(code)
  const pdfDocument = await PDFDocument.create()

  await pdfRenderer.renderToPdf(tokens, pdfDocument)

  fs.writeFileSync(
    'examples/default-color.pdf',
    await pdfDocument.save(),
    'binary'
  )
})()
