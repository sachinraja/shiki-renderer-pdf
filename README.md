# shiki-renderer-pdf

PDF renderer for shiki

# Usage

```js
import fs from 'fs'
import shiki from 'shiki'
import { getPdfRenderer, hexToRgb } from 'shiki-renderer-pdf'
;(async () => {
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

  const code = fs.readFileSync('gen-pdf.js', 'utf-8')

  const tokens = highlighter.codeToThemedTokens(code, 'js')
  const pdfDocument = await PDFDocument.create()

  await pdfRenderer.renderToPdf(tokens, pdfDocument)

  fs.writeFileSync('gen-pdf.js.pdf', await pdfDocument.save())

  console.log('done: gen-pdf.js.pdf')
})()
```
