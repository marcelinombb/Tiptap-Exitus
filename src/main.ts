import './public/style.css'

import { BulletList } from '@tiptap/extension-bullet-list'
import { Document } from '@tiptap/extension-document'
import { Dropcursor } from '@tiptap/extension-dropcursor'
import { Gapcursor } from '@tiptap/extension-gapcursor'
import { HardBreak } from '@tiptap/extension-hard-break'
import { Heading } from '@tiptap/extension-heading'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import { OrderedList } from '@tiptap/extension-ordered-list'
// eslint-disable-next-line import-helpers/order-imports
import { Paragraph } from '@tiptap/extension-paragraph'

//import TableCell from '@tiptap/extension-table-cell'

import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import { Text } from '@tiptap/extension-text'

import ExitusEditor from './ExitusEditor'
import { Blockquote } from './extensions/blockquote/blockquote'
import { Bold } from './extensions/bold'
import { History } from './extensions/history/history'
import { Image } from './extensions/image/image'
import { Indent } from './extensions/indent/indent'
import { Italic } from './extensions/italic/Italic'
import { Katex } from './extensions/katex/katex'
import { ListItem } from './extensions/listitem/listItem'
import { MathType } from './extensions/mathtype/mathtype'
import { Strike } from './extensions/strike/strike'
import { Subscript } from './extensions/subscript/subscript'
import { Superscript } from './extensions/superscript/superscript'
import { Tab } from './extensions/tab/tab'
import TableCell from './extensions/table-cell/src'
import { TableCustom } from './extensions/table/table'
import { TextAlign } from './extensions/textAlign'
import { Underline } from './extensions/underline/underline'

ExitusEditor.extensions = [
  Blockquote,
  ListItem,
  Tab,
  Gapcursor,
  HorizontalRule,
  Italic,
  Document,
  HardBreak,
  Dropcursor,
  Heading,
  History,
  BulletList,
  Strike,
  Paragraph,
  OrderedList,
  Text,
  Subscript,
  Superscript,
  Bold,
  Image.configure({
    inline: true,
    allowBase64: true
  }),
  TableCustom.configure({
    resizable: true,
    allowTableNodeSelection: true,
    cellMinWidth: 100
  }),
  TableRow,
  TableHeader,
  TableCell,
  TextAlign.configure({
    types: ['heading', 'paragraph']
  }),
  Underline,
  Katex,
  Indent,
  MathType
]

ExitusEditor.toolbarOrder = [
  'bold',
  'italic',
  'underline',
  'strike',
  'subscript',
  'superscript',
  '|',
  'table',
  'textAlign',
  'image',
  'blockquote',
  'history',
  'listItem',
  'indent',
  '|',
  'katex',
  'mathtype'
]

export default ExitusEditor
