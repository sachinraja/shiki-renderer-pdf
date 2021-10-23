import fs from 'node:fs'
import { PDFDocument } from 'pdf-lib'
import shiki from 'shiki'
import { getPdfRenderer, hexToRgb } from '../src'

// eslint-disable-next-line import/newline-after-import
;(async () => {
  // eslint-disable-next-line import/no-named-as-default-member
  const highlighter = await shiki.getHighlighter({
    theme: 'nord',
  })

  const pdfRenderer = getPdfRenderer({
    bg: hexToRgb('#2E3440'),
    fontSize: 12,
    lineNumbers: {
      bg: hexToRgb('#151B27'),
      text: hexToRgb('#fff'),
    },
  })

  const code = fs.readFileSync('examples/gen-pdf.ts', 'utf-8')

  const tokens = highlighter.codeToThemedTokens(code, 'js')
  const pdfDocument = await PDFDocument.create()

  await pdfRenderer.renderToPdf(tokens, pdfDocument)

  fs.writeFileSync('examples/readme.pdf', await pdfDocument.save(), 'binary')

  console.log('done: readme.pdf')
})()
