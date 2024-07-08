import { Plugin } from '@editor/Plugin'
import { Document } from '@tiptap/extension-document'
import Dropcursor from '@tiptap/extension-dropcursor'
import Gapcursor from '@tiptap/extension-gapcursor'
import HardBreak from '@tiptap/extension-hard-break'
import Heading from '@tiptap/extension-heading'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Paragraph from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'

export class DefaultPlugin extends Plugin {
  static get pluginName() {
    return 'defaultplugin'
  }
  static get requires() {
    return [Document, Text, Paragraph, Gapcursor, HorizontalRule, HardBreak, Dropcursor, Heading]
  }
  init(): void {}
}
