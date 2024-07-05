import { type Plugin } from '@editor/Plugin'
import { Toolbar } from '@editor/toolbar'
import { createHTMLElement } from '@editor/utils'
import { type AnyExtension, Editor, type EditorOptions, Extension } from '@tiptap/core'
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
interface Config {
  [key: string]: any
}

export interface ExitusEditorOptions extends EditorOptions {
  container: Element
  toolbarOrder: string[]
  config: Config
}

export type PluginClassConstructor = typeof Plugin

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

class ExitusEditor extends Editor {
  editorInstance: string
  toolbar: Toolbar
  toolbarItemsDiv!: HTMLDivElement
  editorMainDiv!: HTMLDivElement

  static extensions: AnyExtension[]
  static plugins: PluginClassConstructor[]
  static toolbarOrder: string[]

  constructor(options: Partial<ExitusEditorOptions> = {}) {
    /* let ext = ExitusEditor.extensions
    if (options.config !== undefined) {
      ext = ExitusEditor.extensions.map(ext => {
        const conf = options!.config![ext.name]
        if (conf) {
          return ext.configure(conf)
        }
        return ext
      })
    } */

    const ext = ExitusEditor.plugins.reduce<AnyExtension[]>(
      (acc, plugin) => {
        return [...acc, ...plugin.requires]
      },
      [Document, Text, Paragraph]
    )

    super({ ...options, extensions: ext })
    this.editorInstance = generateUUID()

    const toolbarOrder: string[] = [...ExitusEditor.toolbarOrder, ...(options.toolbarOrder ?? [])]

    this.toolbar = new Toolbar(this, toolbarOrder)

    ExitusEditor.plugins.forEach(plugin => new plugin(this).init())

    this._createUI(options.container as Element)
  }

  private _generateEditorUI() {
    this.toolbar.render()
    const toolbarEditor = createHTMLElement('div', { class: 'ex-toolbar-editor' }, [this.toolbar.toolbarItemsDiv])

    const editorMain = this.options.element
    editorMain.className = 'editor-main'
    editorMain.setAttribute('spellcheck', 'false')
    editorMain.setAttribute('id', generateUUID())
    this.editorMainDiv = editorMain as HTMLDivElement

    const editorScroller = createHTMLElement('div', { class: 'editor-scroller' }, [editorMain])

    const editorShell = createHTMLElement('div', { class: 'editor-shell' }, [toolbarEditor, editorScroller])

    this.toolbarItemsDiv = this.toolbar.toolbarItemsDiv

    return editorShell
  }

  private _createUI(container: Element) {
    const editorUI = this._generateEditorUI()
    container.appendChild(editorUI)
  }
}

export default ExitusEditor
