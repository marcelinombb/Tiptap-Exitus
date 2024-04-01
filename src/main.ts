import './public/style.css'

import { Blockquote } from '@tiptap/extension-blockquote'
import { BulletList } from '@tiptap/extension-bullet-list'
import { Document } from '@tiptap/extension-document'
import { Dropcursor } from '@tiptap/extension-dropcursor'
import { Gapcursor } from '@tiptap/extension-gapcursor'
import { HardBreak } from '@tiptap/extension-hard-break'
import { Heading } from '@tiptap/extension-heading'
import { History } from '@tiptap/extension-history'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import Image from '@tiptap/extension-image'
import { ListItem } from '@tiptap/extension-list-item'
import { OrderedList } from '@tiptap/extension-ordered-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import { Text } from '@tiptap/extension-text'

import ExitusEditor from './ExitusEditor'
import { Bold } from './extensions/bold'
import { Italic } from './extensions/italic/Italic'
import { Strike } from './extensions/strike/strike'
import { Subscript } from './extensions/subscript/subscript'
import { Superscript } from './extensions/superscript/superscript'
import { TableCustom } from './extensions/table/table'
import { TextAlign } from './extensions/textAlign'
import { Underline } from './extensions/underline/underline'

ExitusEditor.extensions = [
  Blockquote,
  ListItem,
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
    allowTableNodeSelection: true
  }),
  TableRow,
  TableHeader,
  TableCell,
  TextAlign.configure({
    types: ['heading', 'paragraph', 'table']
  }),
  Underline
]

export default ExitusEditor
