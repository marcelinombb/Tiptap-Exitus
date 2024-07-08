import './public/style.css'

import { BulletList } from '@tiptap/extension-bullet-list'
import { Dropcursor } from '@tiptap/extension-dropcursor'
import { Gapcursor } from '@tiptap/extension-gapcursor'
import { HardBreak } from '@tiptap/extension-hard-break'
import { Heading } from '@tiptap/extension-heading'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import { OrderedList } from '@tiptap/extension-ordered-list'
// eslint-disable-next-line import-helpers/order-imports
import { Paragraph } from '@tiptap/extension-paragraph'

import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'

import ExitusEditor from './ExitusEditor'
import { Blockquote } from './extensions/blockquote/blockquote'
import { BoldPlugin } from './extensions/bold/BoldPlugin'
import { History } from './extensions/history/history'
import { convertImageToBase64Service, Image } from './extensions/image/image'
import { Indent } from './extensions/indent/indent'
import { ItalicPlugin } from './extensions/italic/ItalicPlugin'
import { KatexPlugin } from './extensions/katex/KatexPlugin'
import { ListItem } from './extensions/listitem/listItem'
import { MathType } from './extensions/mathtype/mathtype'
import { StrikePlugin } from './extensions/strike/StrikePlugin'
import { SubscriptPlugin } from './extensions/subscript/SubscriptPlugin'
import { Superscript } from './extensions/superscript/superscript'
import { SuperscriptPlugin } from './extensions/superscript/SuperscriptPlugin'
import { Tab } from './extensions/tab/tab'
import TableCell from './extensions/table-cell/src'
import { TableCustom } from './extensions/table/table'
import { TablePlugin } from './extensions/table/TablePlugin'
import { TextAlign } from './extensions/textAlign'
import { UnderlinePlugin } from './extensions/underline/UnderlinePlugin'
import { TextAlignPlugin } from './extensions/textAlign/TextAlingPlugin'

ExitusEditor.extensions = [
  Blockquote,
  ListItem,
  Tab,
  Gapcursor,
  HorizontalRule,
  HardBreak,
  Dropcursor,
  Heading,
  History,
  BulletList,
  Paragraph,
  OrderedList,
  Superscript,
  Image.configure({
    inline: true,
    allowBase64: true,
    conversionService: convertImageToBase64Service
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
  Indent,
  MathType
]

ExitusEditor.plugins = [
  BoldPlugin, 
  ItalicPlugin, 
  UnderlinePlugin, 
  KatexPlugin, 
  StrikePlugin, 
  SubscriptPlugin, 
  SuperscriptPlugin, 
  TablePlugin, 
  TextAlignPlugin
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
