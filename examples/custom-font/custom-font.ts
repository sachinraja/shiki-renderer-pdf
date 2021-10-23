import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import { getHighlighter } from 'shiki'
import { PDFDocument } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { renderToPdf, hexToRgb } from '../../src'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const renderPdf = async () => {
  const highlighter = await getHighlighter({ theme: 'nord' })

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

  const tokens = highlighter.codeToThemedTokens(
    fs.readFileSync('examples/gen-pdf.ts', 'utf8'),
    'typescript'
  )

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

  fs.writeFileSync(
    'examples/custom-font.pdf',
    await pdfDocument.save(),
    'binary'
  )
}

void renderPdf()
