import fs from 'node:fs'
import { getHighlighter } from 'shiki'
import { renderToPdf } from './src'

const a = async () => {
  const highlighter = await getHighlighter({ theme: 'solarized-dark' })

  const pdf = await renderToPdf(
    highlighter.codeToThemedTokens(
      fs.readFileSync('src/index.ts', 'utf8'),
      'js'
    )
  )

  fs.writeFileSync('example.pdf', await pdf.save())
}

void a()
