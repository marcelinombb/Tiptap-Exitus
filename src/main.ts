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
import { Italic } from '@tiptap/extension-italic'
import { ListItem } from '@tiptap/extension-list-item'
import { OrderedList } from '@tiptap/extension-ordered-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Strike } from '@tiptap/extension-strike'
import { Text } from '@tiptap/extension-text'
import ExitusEditor from './ExitusEditor'

const defaultText = `<h2>Bilingual Personality Disorder</h2><p>This may be the first time you hear about this made-up disorder but it actually isn’t so far from the truth. Even the studies that were conducted almost half a century show that <strong>the language you speak has more effects on you than you realize</strong>.</p><p>One of the very first experiments conducted on this topic dates back to 1964. <a href="https://www.researchgate.net/publication/9440038_Language_and_TAT_content_in_bilinguals">In the experiment</a> designed by linguist Ervin-Tripp who is an authority expert in psycholinguistic and sociolinguistic studies, adults who are bilingual in English in French were showed series of pictures and were asked to create 3-minute stories. In the end participants emphasized drastically different dynamics for stories in English and French.</p><p>Another ground-breaking experiment which included bilingual Japanese women married to American men in San Francisco were asked to complete sentences. The goal of the experiment was to investigate whether or not human feelings and thoughts are expressed differently in <strong>different language mindsets</strong>. Here is a sample from the the experiment:</p><figure class="table"><table><thead><tr><th>&nbsp;</th><th>English</th><th>Japanese</th></tr></thead><tbody><tr><td>Real friends should</td><td>Be very frank</td><td>Help each other</td></tr><tr><td>I will probably become</td><td>A teacher</td><td>A housewife</td></tr><tr><td>When there is a conflict with family</td><td>I do what I want</td><td>It's a time of great unhappiness</td></tr></tbody></table></figure><p>More recent <a href="https://books.google.pl/books?id=1LMhWGHGkRUC">studies</a> show, the language a person speaks affects their cognition, behaviour, emotions and hence <strong>their personality</strong>. This shouldn’t come as a surprise <a href="https://en.wikipedia.org/wiki/Lateralization_of_brain_function">since we already know</a> that different regions of the brain become more active depending on the person’s activity at hand. Since structure, information and especially <strong>the culture</strong> of languages varies substantially and the language a person speaks is an essential element of daily life.</p>`

const titems = document.querySelector<HTMLDivElement>('.toolbar-items')

/* titems!.append(createButton(bold))
titems!.append(createButton(italic)) */

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

const exitusEditor = new ExitusEditor({
  container: document.querySelector('.element') as HTMLElement,
  toolbar: ['bold', 'italic'],
  defaultContent: defaultText
})

window.editor = exitusEditor.getEditor()