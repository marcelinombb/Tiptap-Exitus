import Bold from './extensions/bold'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TextAlign from '@tiptap/extension-text-align'
import TableCustom from './extensions/table'
import { Blockquote } from '@tiptap/extension-blockquote'
import { BulletList } from '@tiptap/extension-bullet-list'
import { Document } from '@tiptap/extension-document'
import { Dropcursor } from '@tiptap/extension-dropcursor'
import { Gapcursor } from '@tiptap/extension-gapcursor'
import { HardBreak } from '@tiptap/extension-hard-break'
import { Heading } from '@tiptap/extension-heading'
import { History } from '@tiptap/extension-history'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import Italic from './extensions/italic/Italic'
import { ListItem } from '@tiptap/extension-list-item'
import { OrderedList } from '@tiptap/extension-ordered-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Strike } from '@tiptap/extension-strike'
import { Text } from '@tiptap/extension-text'
import ExitusEditor from './ExitusEditor'

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
  Bold,
  TableCustom.configure({
    resizable: true,
    allowTableNodeSelection: true
  }),
  TableRow,
  TableHeader,
  TableCell,
  TextAlign.configure({
    types: ['heading', 'paragraph', "table"],
  }),
]

export default ExitusEditor;