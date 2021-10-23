# shiki-renderer-pdf

PDF renderer for shiki

# Installation

```shell
npm install shiki-renderer-pdf pdf-lib
```

# Usage

```js
import fs from 'node:fs'
import shiki from 'shiki'
import { PDFDocument } from 'pdf-lib'
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

[Result](https://github.com/sachinraja/shiki-renderer-pdf/blob/main/examples/readme.pdf)

Read more about what you can do with `pdfDocument` [here](https://pdf-lib.js.org/).

## Custom Fonts

This requires an extra install - `@pdf-lib/fontkit`.

Please note that the renderer works best with fixed width fonts (the default is Courier).

The renderer expects you to setup the `pdfDocument` before passing it. `await PDFDocument.create()` will be enough for most cases, but you may need to do more for features like custom fonts:

```js
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import shiki from 'shiki'
import { PDFDocument } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { renderToPdf, hexToRgb } from 'shiki-renderer-pdf'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

;(async () => {
  const highlighter = await shiki.getHighlighter({ theme: 'nord' })

  const pdfDocument = await PDFDocument.create()
  pdfDocument.registerFontkit(fontkit)

  const fontRegular = await pdfDocument.embedFont(
    fs.readFileSync(path.join(__dirname, 'UbuntuMono-Regular.ttf'))
  )
  const fontBold = await pdfDocument.embedFont(
    fs.readFileSync(path.join(__dirname, 'UbuntuMono-Bold.ttf'))
  )
  const fontItalic = await pdfDocument.embedFont(
    fs.readFileSync(path.join(__dirname, 'UbuntuMono-Italic.ttf'))
  )

  const code = fs.readFileSync('gen-pdf.js', 'utf8')
  const tokens = highlighter.codeToThemedTokens(code, 'js')

  await renderToPdf(tokens, pdfDocument, {
    bg: hexToRgb('#2E3440'),
    lineNumbers: {
      bg: hexToRgb('#151B27'),
      text: hexToRgb('#fff'),
    },
    fontSize: 14,
    fontMap: {
      regular: fontRegular,
      bold: fontBold,
      italic: fontItalic,
    },
  })
})()
```

[Result](https://github.com/sachinraja/shiki-renderer-pdf/blob/main/examples/custom-font.pdf)

# Examples

See the [examples](https://github.com/sachinraja/shiki-renderer-pdf/tree/main/examples) for more on how the renderer can be used.
