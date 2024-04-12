// @ts-nocheck
import ExitusEditor from './main'

const defaultText = `<span class= "ex-tab"></span>The editor instance will provide a bunch of public methods. Methods are regular functions and can return anything. They’ll help you to work with the editor.

Don’t confuse methods with commands. Commands are used to change the state of editor (content, selection, and so on) and only return true or false.

#`

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

const editor2 = new ExitusEditor({
  container: document.querySelector('.element2') as HTMLElement,
  toolbar,
  content: defaultText
})

//window.editor = editor
