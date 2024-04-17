// @ts-nocheck
import ExitusEditor from './main'

const defaultText = `<span class= "ex-tab">asdfsadfsdfsdfdsf</span>
The editor instance will provide a bunch of public methods. Methods are regular functions and can return anything. They’ll help you to work with the editor.

Don’t confuse methods with commands. Commands are used to change the state of editor (content, selection, and so on) and only return true or false.

#
<img src="data:image/jpeg;base64,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">


`

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
