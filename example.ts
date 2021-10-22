import fs from 'node:fs'
import { getHighlighter } from 'shiki'
import { renderToPdf } from './src'

const a = async () => {
  const highlighter = await getHighlighter({ theme: 'solarized-dark' })

  const pdf = await renderToPdf(
    highlighter.codeToThemedTokens(
      'console.log("Hello world")console.log("Hello world")console.log("Hello world")console.log("Hello world")\nconsole.log("Hello world")console.log("Hello world")console.log("Hello world")',
      'js'
    )
  )

  fs.writeFileSync('example.pdf', await pdf.save())
}

void a()
