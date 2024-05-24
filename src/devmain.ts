// @ts-nocheck
import ExitusEditor from './main'

const defaultText =
  '<table ballonactive="false" style="border: 5px solid cornflowerblue;" styletablewrapper=""><colgroup><col><col><col><col></colgroup><tbody><tr><th colspan="1" rowspan="1"><p style="margin-left: 0px!important;"></p></th><th colspan="1" rowspan="1"><p style="margin-left: 0px!important;"></p></th><th colspan="1" rowspan="1"><p style="margin-left: 0px!important;"></p></th><th colspan="1" rowspan="1"><p style="margin-left: 0px!important;"></p></th></tr><tr><td colspan="1" rowspan="1" style=""><p style="margin-left: 0px!important;"></p></td><td colspan="1" rowspan="1" style=""><p style="margin-left: 0px!important;"></p></td><td colspan="1" rowspan="1" style=""><p style="margin-left: 0px!important;"></p></td><td colspan="1" rowspan="1" style=""><p style="margin-left: 0px!important;"></p></td></tr><tr><td colspan="1" rowspan="1" style=""><p style="margin-left: 0px!important;"></p></td><td colspan="1" rowspan="1" style=""><p style="margin-left: 0px!important;"></p></td><td colspan="1" rowspan="1" style=""><p style="margin-left: 0px!important;"></p></td><td colspan="1" rowspan="1" style=""><p style="margin-left: 0px!important;"></p></td></tr></tbody></table>'

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

window.editor = editor
