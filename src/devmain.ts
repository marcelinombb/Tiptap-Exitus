// @ts-nocheck
import katex from 'katex'

import ExitusEditor from './main'

const defaultText =
  '<p style="margin-left: 0px!important;"><span class="ex-tab">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> The editor instance will provide a bunch of public methods. Methods are regular functions and can return anything. They’ll help you to work with the editor. Don’t confuse methods with commands. Commands are used to change the state of editor (content, selection, and so on) and only return true or false. # <span class="math-tex katex-display">\\displaystyle \\frac{1}{\\Bigl(\\sqrt{\\phi \\sqrt{5}}-\\phi\\Bigr) e^{\\frac25 \\pi}} = 1+\\frac{e^{-2\\pi}} {1+\\frac{e^{-4\\pi}} {1+\\frac{e^{-6\\pi}} {1+\\frac{e^{-8\\pi}} {1+\\cdots} } } }</span></p><p style="margin-left: 0px!important;"></p><p style="margin-left: 0px!important;"></p>'

const toolbar = [
  'bold',
  'italic',
  'underline',
  'strike',
  'subscript',
  'superscript',
  'table',
  'textAlign',
  'image',
  'blockquote',
  'katex',
  'history',
  'listItem',
  'indent'
]

const editor = new ExitusEditor({
  container: document.querySelector('.element') as HTMLElement,
  toolbar,
  content: defaultText
})

editor.on('create', ({ editor }) => {
  const htmlContent = document.querySelector('.html-content') as Element
  htmlContent.innerHTML = parseLatex(editor.getHTML())
})

function parseLatex(text: string) {
  const regex = new RegExp('<span class="math-tex">(.*?)<\\/span>', 'g')
  let match

  let dataModified = text

  while ((match = regex.exec(text)) !== null) {
    let renderFormula
    try {
      renderFormula = katex.renderToString(match[1], {
        //displayMode: true,
        output: 'html'
      })
      dataModified = dataModified.replace(match[0], `<span class="math-tex">${renderFormula}</span>`)
    } catch (e) {}
  }

  return dataModified
}

editor.on('update', ({ editor }) => {
  const htmlContent = document.querySelector('.html-content') as Element

  const latexMatches = parseLatex(editor.getHTML())

  htmlContent.innerHTML = latexMatches
})

window.editor = editor
