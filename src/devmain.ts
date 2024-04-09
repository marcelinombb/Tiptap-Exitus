// @ts-nocheck
import ExitusEditor from './main'

const defaultText = `<p style="text-align:justify;"><span class="math-tex">\\(\\sqrt{2}\\)</span>&nbsp;e&nbsp;<span class="math-tex">\\(\\mathsf{B=3x+2}\\)</span> Analise o modelo atômico representado pela imagem abaixo.</p><p>&nbsp;</p>`

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
  'history',
  'listItem',
  'katex'
]

const editor = new ExitusEditor({
  container: document.querySelector('.element') as HTMLElement,
  toolbar,
  content: defaultText
})

const editor2 = new ExitusEditor({
  container: document.querySelector('.element2') as HTMLElement,
  toolbar,
  content: defaultText
})

//window.editor = editor
