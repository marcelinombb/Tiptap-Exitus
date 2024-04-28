// @ts-nocheck
import katex from 'katex'

import ExitusEditor from './main'

const defaultText =
  '<p style="margin-left: 0px!important;"><span class="ex-tab">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> The editor instance will provide a bunch of public methods. Methods are regular functions and can return anything. They’ll help you to work with the editor. Don’t confuse methods with commands. Commands are used to change the state of editor (content, selection, and so on) and only return true or false. # <span class="math-tex">\\(\\sqrt{2}\\)</span></p><p style="margin-left: 0px!important;"></p><p style="margin-left: 0px!important;"></p>'

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
  htmlContent.innerHTML = editor.getHTML()
})

function parseLatex(text: string) {
  const regex = new RegExp('<span class="math-tex">(.*?)<\\/span>', 'g')
  const matches = []
  let match

  while ((match = regex.exec(text)) !== null) {
    console.log(match)

    matches.push(match[1])
  }

  if (matches.length == 0) return [text]

  return matches
}

editor.on('update', ({ editor }) => {
  const htmlContent = document.querySelector('.html-content') as Element

  const latexMatches = parseLatex(editor.getHTML())

  let content = editor.getHTML()

  try {
    latexMatches.forEach(latex => {
      content = content.replace(`\\(${latex}\\)`, `<span class="latex">${katex.renderToString(latex, { output: 'html' })}</span>`)
    })
  } catch (error) {}

  htmlContent.innerHTML = content
})

window.editor = editor
